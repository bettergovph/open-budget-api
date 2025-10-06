import { Injectable, Logger } from '@nestjs/common';
import { Neo4jService } from '../../database/neo4j/neo4j.service';
import {
  DepartmentDto,
  DepartmentDetailDto,
} from './dto/department-response.dto';
import {
  BudgetChangeStatus,
  DepartmentDetailsDto,
} from './dto/department-details.dto';
import {
  Agency,
  DepartmentDetails,
  FundingSourcesBudget,
  GaaNepData,
  OperatingUnitClass,
  RegionsBudget,
} from './interface/department-details.interface';

@Injectable()
export class DepartmentsService {
  private readonly logger = new Logger(DepartmentsService.name);

  constructor(private readonly neo4jService: Neo4jService) {}

  async getAllDepartments(
    withBudget?: boolean,
    year?: string,
    type?: string,
  ): Promise<DepartmentDto[]> {
    try {
      this.logger.log(
        `getAllDepartments called with: withBudget=${withBudget}, year=${year}, type=${type}`,
      );

      let cypher = `MATCH (d:Department)`;

      if (withBudget && year && type) {
        this.logger.log('Fetching total NEP budget...');
        // First get total NEP budget to calculate percentages
        const totalBudgetResult = await this.neo4jService.querySingle<{
          totalNepBudget: number;
        }>(
          `MATCH (br:BudgetRecord {fiscal_year: $year, budget_type: $type})
           RETURN sum(br.amount) as totalNepBudget`,
          { year, type },
        );

        const totalNepBudget = totalBudgetResult?.totalNepBudget
          ? Number(totalBudgetResult.totalNepBudget)
          : 0;

        this.logger.log(`Total NEP budget: ${totalNepBudget}`);

        cypher = `
          MATCH (d:Department)
          OPTIONAL MATCH (d)-[:HAS_AGENCY]->(a:Agency)
          WITH d, count(DISTINCT a) as agencyCount
          OPTIONAL MATCH (brNep:BudgetRecord {fiscal_year: $year, budget_type: $type})-[:ALLOCATED_TO]->(org:Organization {department_code: d.code})
          WITH d, agencyCount, sum(brNep.amount) as totalBudgetNep
          OPTIONAL MATCH (brGaa:BudgetRecord {fiscal_year: $year, budget_type: 'GAA'})-[:ALLOCATED_TO]->(org2:Organization {department_code: d.code})
          WITH d, agencyCount, totalBudgetNep, sum(brGaa.amount) as totalBudgetGaa
          RETURN d.code as code, d.description as description, totalBudgetNep, totalBudgetGaa, agencyCount
          ORDER BY totalBudgetNep DESC
        `;

        this.logger.log('Executing department budget query...', cypher);
        const results = await this.neo4jService.query<{
          code: string;
          description: string;
          totalBudgetNep: number;
          totalBudgetGaa: number;
          agencyCount: number;
        }>(cypher, { year, type });

        this.logger.log(`Found ${results.length} departments`);

        return results.map((item) => {
          const budgetNep = item.totalBudgetNep
            ? Number(item.totalBudgetNep)
            : 0;
          const budgetGaa = item.totalBudgetGaa
            ? Number(item.totalBudgetGaa)
            : 0;
          const percentOfTotal =
            totalNepBudget > 0 ? (budgetNep / totalNepBudget) * 100 : 0;
          const percentDiff =
            budgetNep > 0 ? ((budgetGaa - budgetNep) / budgetNep) * 100 : 0;

          return {
            code: item.code,
            description: item.description,
            totalBudget: budgetNep,
            totalBudgetPesos: budgetNep * 1000,
            percentOfTotalBudget: Number(percentOfTotal.toFixed(2)),
            totalBudgetGaa: budgetGaa,
            totalBudgetGaaPesos: budgetGaa * 1000,
            percentDifferenceNepGaa: Number(percentDiff.toFixed(2)),
            totalAgencies: Number(item.agencyCount),
          };
        });
      } else {
        cypher += ` RETURN d.code as code, d.description as description ORDER BY d.code`;

        this.logger.log('Executing basic department query...');
        const results = await this.neo4jService.query<{
          code: string;
          description: string;
        }>(cypher);

        this.logger.log(`Found ${results.length} departments`);

        return results.map((item) => ({
          code: item.code,
          description: item.description,
        }));
      }
    } catch (error) {
      this.logger.error('Error in getAllDepartments:', error);
      throw error;
    }
  }

  async getDepartmentByCode(
    code: string,
    withBudget?: boolean,
    year?: string,
    type?: string,
  ): Promise<DepartmentDto | null> {
    let cypher = `MATCH (d:Department {code: $code})`;

    if (withBudget && year && type) {
      cypher += `
        OPTIONAL MATCH (br:BudgetRecord {fiscal_year: $year, budget_type: $type})-[:ALLOCATED_TO]->(org:Organization {department_code: d.code})
        WITH d, sum(br.amount) as totalBudget
        RETURN d.code as code, d.description as description, totalBudget
      `;

      const result = await this.neo4jService.querySingle<{
        code: string;
        description: string;
        totalBudget: number;
      }>(cypher, { code, year, type });

      if (!result) return null;

      const budget = result.totalBudget ? Number(result.totalBudget) : 0;
      return {
        code: result.code,
        description: result.description,
        totalBudget: budget,
        totalBudgetPesos: budget * 1000,
      };
    } else {
      cypher += ` RETURN d.code as code, d.description as description`;

      const result = await this.neo4jService.querySingle<{
        code: string;
        description: string;
      }>(cypher, { code });

      if (!result) return null;

      return {
        code: result.code,
        description: result.description,
      };
    }
  }

  async getDepartmentDetails(
    code: string,
    year?: string,
  ): Promise<DepartmentDetailsDto | null> {
    const departmentData =
      await this.neo4jService.querySingle<DepartmentDetails>(
        `MATCH (d:Department {code: $code})
       RETURN d.code as code, d.description as description, d.abbreviation as abbreviation`,
        { code },
      );

    if (!departmentData) return null;

    const result: DepartmentDetailsDto = {
      code: departmentData.code,
      description: departmentData.description,
      abbreviation: departmentData.abbreviation,
      agencies: [],
      operatingUnitClasses: [],
      statistics: {
        totalAgencies: 0,
        totalOperatingUnitClasses: 0,
        totalRegions: 0,
        totalFundingSources: 0,
        totalExpenseClassifications: 0,
        totalProjects: 0,
      },
    };

    if (year) {
      // Get agencies with budget totals
      const agencies = await this.neo4jService.query<Agency>(
        `MATCH (d:Department {code: $code})-[:HAS_AGENCY]->(a:Agency)
         OPTIONAL MATCH (br:BudgetRecord {fiscal_year: $year})-[:ALLOCATED_TO]->(org:Organization {agency_code: a.code})
         RETURN a.code as code, a.description as description, a.uacs_code as uacsCode,
                sum(CASE WHEN br.budget_type = 'NEP' THEN br.amount ELSE 0 END) as nepBudget,
                sum(CASE WHEN br.budget_type = 'GAA' THEN br.amount ELSE 0 END) as gaaBudget
         ORDER BY a.code`,
        { code, year },
      );

      result.agencies = agencies.map((a) => {
        const nepAmt = Number(a.nepBudget);
        const gaaAmt = Number(a.gaaBudget);
        return {
          code: a.code,
          description: a.description,
          uacsCode: a.uacsCode,
          nep: { amount: nepAmt, amountPesos: nepAmt * 1000 },
          gaa: { amount: gaaAmt, amountPesos: gaaAmt * 1000 },
        };
      });

      // Get operating unit classes with count and budget
      const operatingUnitClasses =
        await this.neo4jService.query<OperatingUnitClass>(
          `MATCH (d:Department {code: $code})-[:HAS_AGENCY]->(:Agency)-[:HAS_OPERATING_UNIT_CLASS]->(ouc:OperatingUnitClass)
         OPTIONAL MATCH (ouc)-[:HAS_OPERATING_UNIT]->(ou:OperatingUnit)
         WITH ouc, count(DISTINCT ou) as ouCount
         OPTIONAL MATCH (br:BudgetRecord {fiscal_year: $year})-[:ALLOCATED_TO]->(org:Organization {department_code: $code})
         WHERE org.class_code = ouc.code
         RETURN ouc.code as code, ouc.description as description, ouc.status as status,
                ouCount as operatingUnitCount,
                sum(CASE WHEN br.budget_type = 'NEP' THEN br.amount ELSE 0 END) as nepBudget,
                sum(CASE WHEN br.budget_type = 'GAA' THEN br.amount ELSE 0 END) as gaaBudget
         ORDER BY ouc.code`,
          { code, year },
        );

      result.operatingUnitClasses = operatingUnitClasses.map((ouc) => {
        const nepAmt = Number(ouc.nepBudget);
        const gaaAmt = Number(ouc.gaaBudget);
        return {
          code: ouc.code,
          description: ouc.description,
          status: ouc.status,
          operatingUnitCount: Number(ouc.operatingUnitCount),
          nep: { amount: nepAmt, amountPesos: nepAmt * 1000 },
          gaa: { amount: gaaAmt, amountPesos: gaaAmt * 1000 },
        };
      });
    } else {
      // Get agencies without budget
      const agencies = await this.neo4jService.query<Agency>(
        `MATCH (d:Department {code: $code})-[:HAS_AGENCY]->(a:Agency)
         RETURN a.code as code, a.description as description, a.uacs_code as uacsCode
         ORDER BY a.code`,
        { code },
      );

      result.agencies = agencies;

      // Get operating unit classes without budget
      const operatingUnitClasses =
        await this.neo4jService.query<OperatingUnitClass>(
          `MATCH (d:Department {code: $code})-[:HAS_AGENCY]->(:Agency)-[:HAS_OPERATING_UNIT_CLASS]->(ouc:OperatingUnitClass)
         OPTIONAL MATCH (ouc)-[:HAS_OPERATING_UNIT]->(ou:OperatingUnit)
         RETURN ouc.code as code, ouc.description as description, ouc.status as status,
                count(DISTINCT ou) as operatingUnitCount
         ORDER BY ouc.code`,
          { code },
        );

      result.operatingUnitClasses = operatingUnitClasses.map((ouc) => ({
        code: ouc.code,
        description: ouc.description,
        status: ouc.status,
        operatingUnitCount: Number(ouc.operatingUnitCount),
      }));
    }

    if (year) {
      // Get NEP and GAA totals in ONE query
      const budgetTotals = await this.neo4jService.querySingle<GaaNepData>(
        `MATCH (br:BudgetRecord {fiscal_year: $year})-[:ALLOCATED_TO]->(org:Organization {department_code: $code})
         RETURN
           sum(CASE WHEN br.budget_type = 'NEP' THEN br.amount ELSE 0 END) as nepTotal,
           sum(CASE WHEN br.budget_type = 'GAA' THEN br.amount ELSE 0 END) as gaaTotal`,
        { code, year },
      );

      const nep = budgetTotals?.nepTotal ? Number(budgetTotals.nepTotal) : 0;
      const gaa = budgetTotals?.gaaTotal ? Number(budgetTotals.gaaTotal) : 0;
      const difference = gaa - nep;
      const percentChange = nep > 0 ? (difference / nep) * 100 : 0;

      result.budgetComparison = {
        nep: { amount: nep, amountPesos: nep * 1000 },
        gaa: { amount: gaa, amountPesos: gaa * 1000 },
        difference: {
          amount: difference,
          amountPesos: difference * 1000,
          percentChange: Number(percentChange.toFixed(2)),
          status:
            percentChange > 0
              ? BudgetChangeStatus.Increased
              : percentChange < 0
                ? BudgetChangeStatus.Decreased
                : BudgetChangeStatus.NoChange,
        },
      };

      // Get regions with NEP and GAA in ONE query
      const regions = await this.neo4jService.query<RegionsBudget>(
        `MATCH (br:BudgetRecord {fiscal_year: $year})-[:ALLOCATED_TO]->(org:Organization {department_code: $code})
         MATCH (br)-[:LOCATED_IN_REGION]->(r:Region)
         RETURN r.code as code, r.description as description,
           sum(CASE WHEN br.budget_type = 'NEP' THEN br.amount ELSE 0 END) as nepBudget,
           sum(CASE WHEN br.budget_type = 'GAA' THEN br.amount ELSE 0 END) as gaaBudget
         ORDER BY gaaBudget DESC`,
        { code, year },
      );

      result.regions = regions.map((r) => {
        const nepAmt = Number(r.nepBudget);
        const gaaAmt = Number(r.gaaBudget);
        const diff = gaaAmt - nepAmt;
        const pctChange = nepAmt > 0 ? (diff / nepAmt) * 100 : 0;
        return {
          code: r.code,
          description: r.description,
          nep: { amount: nepAmt, amountPesos: nepAmt * 1000 },
          gaa: { amount: gaaAmt, amountPesos: gaaAmt * 1000 },
          difference: diff,
          differencePesos: diff * 1000,
          percentChange: Number(pctChange.toFixed(2)),
        };
      });

      // Get funding sources with NEP and GAA
      const fundingSources =
        await this.neo4jService.query<FundingSourcesBudget>(
          `MATCH (br:BudgetRecord {fiscal_year: $year})-[:ALLOCATED_TO]->(org:Organization {department_code: $code})
         MATCH (br)-[:FUNDED_BY]->(fs:FundingSource)
         RETURN fs.uacs_code as uacsCode, fs.description as description,
                fs.fund_cluster_code as fundClusterCode,
                sum(CASE WHEN br.budget_type = 'NEP' THEN br.amount ELSE 0 END) as nepBudget,
                sum(CASE WHEN br.budget_type = 'GAA' THEN br.amount ELSE 0 END) as gaaBudget
         ORDER BY gaaBudget DESC`,
          { code, year },
        );

      result.fundingSources = fundingSources.map((fs) => {
        const nepAmt = Number(fs.nepBudget);
        const gaaAmt = Number(fs.gaaBudget);
        const diff = gaaAmt - nepAmt;
        const pctChange = nepAmt > 0 ? (diff / nepAmt) * 100 : 0;
        return {
          uacsCode: fs.uacsCode,
          description: fs.description,
          fundClusterCode: fs.fundClusterCode,
          nep: { amount: nepAmt, amountPesos: nepAmt * 1000 },
          gaa: { amount: gaaAmt, amountPesos: gaaAmt * 1000 },
          difference: diff,
          differencePesos: diff * 1000,
          percentChange: Number(pctChange.toFixed(2)),
        };
      });

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
        `MATCH (br:BudgetRecord {fiscal_year: $year})-[:ALLOCATED_TO]->(org:Organization {department_code: $code})
         MATCH (br)-[:CLASSIFIED_AS]->(so:SubObject)
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
        { code, year },
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

      result.expenseClassifications = Array.from(expenseHierarchy.values()).map(
        (cls) => ({
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
        }),
      );

      // Get projects (distinct prexc_fpap_id with descriptions)
      const projects = await this.neo4jService.query<{
        prexcFpapId: string;
        description: string;
        nepBudget: number;
        gaaBudget: number;
      }>(
        `MATCH (br:BudgetRecord {fiscal_year: $year})-[:ALLOCATED_TO]->(org:Organization {department_code: $code})
         WHERE br.prexc_fpap_id IS NOT NULL AND br.prexc_fpap_id <> ''
         WITH br.prexc_fpap_id as prexcFpapId,
              collect(DISTINCT br.description)[0] as description,
              sum(CASE WHEN br.budget_type = 'NEP' THEN br.amount ELSE 0 END) as nepBudget,
              sum(CASE WHEN br.budget_type = 'GAA' THEN br.amount ELSE 0 END) as gaaBudget
         RETURN prexcFpapId, description, nepBudget, gaaBudget
         ORDER BY gaaBudget DESC`,
        { code, year },
      );

      result.projects = projects.map((p) => {
        const nepAmt = Number(p.nepBudget);
        const gaaAmt = Number(p.gaaBudget);
        return {
          prexcFpapId: p.prexcFpapId,
          description: p.description,
          nep: { amount: nepAmt, amountPesos: nepAmt * 1000 },
          gaa: { amount: gaaAmt, amountPesos: gaaAmt * 1000 },
        };
      });
    }

    result.statistics = {
      totalAgencies: result.agencies?.length || 0,
      totalOperatingUnitClasses: result.operatingUnitClasses?.length || 0,
      totalRegions: result.regions?.length || 0,
      totalFundingSources: result.fundingSources?.length || 0,
      totalExpenseClassifications: result.expenseClassifications?.length || 0,
      totalProjects: result.projects?.length || 0,
    };

    return result;
  }
}
