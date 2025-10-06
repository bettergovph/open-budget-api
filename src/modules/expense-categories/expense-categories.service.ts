import { Injectable, Logger } from '@nestjs/common';
import { Neo4jService } from '../../database/neo4j/neo4j.service';
import {
  ExpenseCategoryDto,
  BudgetByExpenseCategoryDto,
} from './dto/expense-category.dto';

@Injectable()
export class ExpenseCategoriesService {
  private readonly logger = new Logger(ExpenseCategoriesService.name);

  constructor(private readonly neo4jService: Neo4jService) {}

  async getBudgetByExpenseCategory(
    year: string,
    type: string,
    includeSubObjects: boolean = false,
  ): Promise<BudgetByExpenseCategoryDto[]> {
    try {
      this.logger.log(
        `getBudgetByExpenseCategory called with: year=${year}, type=${type}, includeSubObjects=${includeSubObjects}`,
      );

      // Get total NEP budget for percentage calculation
      this.logger.log('Fetching total NEP budget...');
      const totalBudgetResult = await this.neo4jService.querySingle<{
        totalNepBudget: number;
      }>(
        `MATCH (br:BudgetRecord {fiscal_year: $year, budget_type: $type})-[:CLASSIFIED_AS]->(:SubObject)-[:IN_CATEGORY]->(:ExpenseCategory)
         RETURN sum(br.amount) as totalNepBudget`,
        { year, type },
      );

      const totalNepBudget = totalBudgetResult?.totalNepBudget
        ? Number(totalBudgetResult.totalNepBudget)
        : 0;

      this.logger.log(`Total NEP budget: ${totalNepBudget}`);

      // Optimized query - get NEP and GAA in one go
      const cypher = `
        MATCH (ec:ExpenseCategory)
        OPTIONAL MATCH (brNep:BudgetRecord {fiscal_year: $year, budget_type: $type})-[:CLASSIFIED_AS]->(:SubObject)-[:IN_CATEGORY]->(ec)
        WITH ec, sum(brNep.amount) as totalBudgetNep, count(brNep) as recordCount
        OPTIONAL MATCH (brGaa:BudgetRecord {fiscal_year: $year, budget_type: 'GAA'})-[:CLASSIFIED_AS]->(:SubObject)-[:IN_CATEGORY]->(ec)
        WITH ec, totalBudgetNep, recordCount, sum(brGaa.amount) as totalBudgetGaa
        RETURN ec.code as categoryCode,
               ec.description as categoryName,
               totalBudgetNep,
               totalBudgetGaa,
               recordCount
        ORDER BY totalBudgetNep DESC
      `;

      this.logger.log('Executing expense category budget query...');
      const results = await this.neo4jService.query<{
        categoryCode: string;
        categoryName: string;
        totalBudgetNep: number;
        totalBudgetGaa: number;
        recordCount: number;
      }>(cypher, { year, type });

      this.logger.log(`Found ${results.length} expense categories`);

      const categories: BudgetByExpenseCategoryDto[] = results.map((item) => {
        const budgetNep = item.totalBudgetNep ? Number(item.totalBudgetNep) : 0;
        const budgetGaa = item.totalBudgetGaa ? Number(item.totalBudgetGaa) : 0;
        const percentOfTotal =
          totalNepBudget > 0 ? (budgetNep / totalNepBudget) * 100 : 0;
        const percentDiff =
          budgetNep > 0 ? ((budgetGaa - budgetNep) / budgetNep) * 100 : 0;

        return {
          categoryCode: item.categoryCode,
          categoryName: item.categoryName,
          totalBudget: budgetNep,
          totalBudgetPesos: budgetNep * 1000,
          percentOfTotalBudget: Number(percentOfTotal.toFixed(2)),
          totalBudgetGaa: budgetGaa,
          totalBudgetGaaPesos: budgetGaa * 1000,
          percentDifferenceNepGaa: Number(percentDiff.toFixed(2)),
          recordCount: item.recordCount || 0,
        };
      });

      // Get top sub-objects if requested
      if (includeSubObjects) {
        this.logger.log('Fetching top sub-objects for each category...');
        for (const category of categories) {
          const subObjCypher = `
            MATCH (br:BudgetRecord {fiscal_year: $year, budget_type: $type})-[:CLASSIFIED_AS]->(so:SubObject)-[:IN_CATEGORY]->(ec:ExpenseCategory {code: $categoryCode})
            WITH so.uacs_code as uacsCode,
                 so.description as description,
                 sum(br.amount) as amount
            RETURN uacsCode, description, amount
            ORDER BY amount DESC
            LIMIT 10
          `;

          const subObjResults = await this.neo4jService.query<{
            uacsCode: string;
            description: string;
            amount: number;
          }>(subObjCypher, {
            year,
            type,
            categoryCode: category.categoryCode,
          });

          category.topSubObjects = subObjResults.map((so) => ({
            uacsCode: so.uacsCode,
            description: so.description,
            amount: so.amount,
            amountPesos: so.amount * 1000,
          }));
        }
      }

      return categories;
    } catch (error) {
      this.logger.error('Error in getBudgetByExpenseCategory:', error);
      throw error;
    }
  }

  async getAllExpenseCategories(year?: string): Promise<any> {
    if (!year) {
      // Return basic structure without budget
      const cypher = `
        MATCH (cls:Classification)
        RETURN cls.code as code, cls.description as description
        ORDER BY cls.code
      `;

      const results = await this.neo4jService.query<{
        code: string;
        description: string;
      }>(cypher);

      return results.map((item) => ({
        code: item.code,
        description: item.description,
      }));
    }

    // Get expense classification hierarchy with NEP and GAA
    const expenseClassifications = await this.neo4jService.query<{
      classificationCode: string;
      classificationDescription: string;
      subClassCode: string;
      subClassDescription: string;
      groupCode: string;
      groupDescription: string;
      objectCode: string;
      objectDescription: string;
      nepBudget: number;
      gaaBudget: number;
    }>(
      `MATCH (br:BudgetRecord {fiscal_year: $year})-[:CLASSIFIED_AS]->(so:SubObject)
       MATCH (obj:Object)-[:HAS_SUB_OBJECT]->(so)
       MATCH (grp:ExpenseGroup)-[:HAS_OBJECT]->(obj)
       MATCH (sc:SubClass)-[:HAS_GROUP]->(grp)
       MATCH (cls:Classification)-[:HAS_SUB_CLASS]->(sc)
       WITH cls.code as classificationCode, cls.description as classificationDescription,
            sc.code as subClassCode, sc.description as subClassDescription,
            grp.code as groupCode, grp.description as groupDescription,
            obj.code as objectCode, obj.description as objectDescription,
            sum(CASE WHEN br.budget_type = 'NEP' THEN br.amount ELSE 0 END) as nepBudget,
            sum(CASE WHEN br.budget_type = 'GAA' THEN br.amount ELSE 0 END) as gaaBudget
       RETURN classificationCode, classificationDescription,
              subClassCode, subClassDescription,
              groupCode, groupDescription,
              objectCode, objectDescription,
              nepBudget, gaaBudget
       ORDER BY classificationCode, subClassCode, groupCode, objectCode`,
      { year },
    );

    // Group by classification -> subclass -> group -> object
    interface ExpenseObject {
      code: string;
      description: string;
      nep: { amount: number; amountPesos: number };
      gaa: { amount: number; amountPesos: number };
    }

    interface ExpenseGroupData {
      code: string;
      description: string;
      nepTotal: number;
      gaaTotal: number;
      objects: ExpenseObject[];
    }

    interface ExpenseSubClassData {
      code: string;
      description: string;
      nepTotal: number;
      gaaTotal: number;
      groups: Map<string, ExpenseGroupData>;
    }

    interface ExpenseClassificationData {
      code: string;
      description: string;
      nepTotal: number;
      gaaTotal: number;
      subClasses: Map<string, ExpenseSubClassData>;
    }

    const expenseHierarchy = new Map<string, ExpenseClassificationData>();

    expenseClassifications.forEach((item) => {
      const clsKey = item.classificationCode;
      if (!expenseHierarchy.has(clsKey)) {
        expenseHierarchy.set(clsKey, {
          code: item.classificationCode,
          description: item.classificationDescription,
          nepTotal: 0,
          gaaTotal: 0,
          subClasses: new Map<string, ExpenseSubClassData>(),
        });
      }

      const cls = expenseHierarchy.get(clsKey)!;
      const scKey = item.subClassCode;
      if (!cls.subClasses.has(scKey)) {
        cls.subClasses.set(scKey, {
          code: item.subClassCode,
          description: item.subClassDescription,
          nepTotal: 0,
          gaaTotal: 0,
          groups: new Map<string, ExpenseGroupData>(),
        });
      }

      const sc = cls.subClasses.get(scKey)!;
      const grpKey = item.groupCode;
      if (!sc.groups.has(grpKey)) {
        sc.groups.set(grpKey, {
          code: item.groupCode,
          description: item.groupDescription,
          nepTotal: 0,
          gaaTotal: 0,
          objects: [],
        });
      }

      const grp = sc.groups.get(grpKey)!;
      const nepAmt = Number(item.nepBudget);
      const gaaAmt = Number(item.gaaBudget);

      grp.objects.push({
        code: item.objectCode,
        description: item.objectDescription,
        nep: { amount: nepAmt, amountPesos: nepAmt * 1000 },
        gaa: { amount: gaaAmt, amountPesos: gaaAmt * 1000 },
      });

      grp.nepTotal += nepAmt;
      grp.gaaTotal += gaaAmt;
      sc.nepTotal += nepAmt;
      sc.gaaTotal += gaaAmt;
      cls.nepTotal += nepAmt;
      cls.gaaTotal += gaaAmt;
    });

    return Array.from(expenseHierarchy.values()).map((cls) => ({
      code: cls.code,
      description: cls.description,
      nep: { amount: cls.nepTotal, amountPesos: cls.nepTotal * 1000 },
      gaa: { amount: cls.gaaTotal, amountPesos: cls.gaaTotal * 1000 },
      subClasses: Array.from(cls.subClasses.values()).map((sc) => ({
        code: sc.code,
        description: sc.description,
        nep: { amount: sc.nepTotal, amountPesos: sc.nepTotal * 1000 },
        gaa: { amount: sc.gaaTotal, amountPesos: sc.gaaTotal * 1000 },
        groups: Array.from(sc.groups.values()).map((grp) => ({
          code: grp.code,
          description: grp.description,
          nep: { amount: grp.nepTotal, amountPesos: grp.nepTotal * 1000 },
          gaa: { amount: grp.gaaTotal, amountPesos: grp.gaaTotal * 1000 },
          objects: grp.objects,
        })),
      })),
    }));
  }
}
