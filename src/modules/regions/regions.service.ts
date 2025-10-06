import { Injectable, Logger } from '@nestjs/common';
import { Neo4jService } from '../../database/neo4j/neo4j.service';
import { RegionDto, RegionalAllocationDto } from './dto/region.dto';

@Injectable()
export class RegionsService {
  private readonly logger = new Logger(RegionsService.name);

  constructor(private readonly neo4jService: Neo4jService) {}

  async getAllRegions(
    withBudget?: boolean,
    year?: string,
    type?: string,
  ): Promise<RegionDto[]> {
    try {
      this.logger.log(
        `getAllRegions called with: withBudget=${withBudget}, year=${year}, type=${type}`,
      );

      let cypher = `MATCH (r:Region)`;

      if (withBudget && year && type) {
        this.logger.log('Fetching total NEP budget...');
        // First get total NEP budget to calculate percentages
        const totalBudgetResult = await this.neo4jService.querySingle<{
          totalNepBudget: number;
        }>(
          `MATCH (br:BudgetRecord {fiscal_year: $year, budget_type: $type})-[:LOCATED_IN_REGION]->(r:Region)
           RETURN sum(br.amount) as totalNepBudget`,
          { year, type },
        );

        const totalNepBudget = totalBudgetResult?.totalNepBudget
          ? Number(totalBudgetResult.totalNepBudget)
          : 0;

        this.logger.log(`Total NEP budget: ${totalNepBudget}`);

        cypher = `
          MATCH (r:Region)
          OPTIONAL MATCH (brNep:BudgetRecord {fiscal_year: $year, budget_type: $type})-[:LOCATED_IN_REGION]->(r)
          WITH r, sum(brNep.amount) as totalBudgetNep
          OPTIONAL MATCH (brGaa:BudgetRecord {fiscal_year: $year, budget_type: 'GAA'})-[:LOCATED_IN_REGION]->(r)
          WITH r, totalBudgetNep, sum(brGaa.amount) as totalBudgetGaa
          RETURN r.code as code,
                 r.description as description,
                 totalBudgetNep,
                 totalBudgetGaa
          ORDER BY totalBudgetNep DESC
        `;

        this.logger.log('Executing region budget query...');
        const results = await this.neo4jService.query<{
          code: string;
          description: string;
          totalBudgetNep: number;
          totalBudgetGaa: number;
        }>(cypher, { year, type });

        this.logger.log(`Found ${results.length} regions`);

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
          };
        });
      } else {
        cypher += ` RETURN r.code as code, r.description as description ORDER BY r.code`;

        this.logger.log('Executing basic region query...');
        const results = await this.neo4jService.query<{
          code: string;
          description: string;
        }>(cypher);

        this.logger.log(`Found ${results.length} regions`);

        return results.map((item) => ({
          code: item.code,
          description: item.description,
        }));
      }
    } catch (error) {
      this.logger.error('Error in getAllRegions:', error);
      throw error;
    }
  }

  async getRegionalAllocation(
    year: string,
    type: string,
    groupByDepartment: boolean = false,
  ): Promise<RegionalAllocationDto[]> {
    let cypher = `
      MATCH (br:BudgetRecord {fiscal_year: $year, budget_type: $type})-[:LOCATED_IN_REGION]->(r:Region)
      WITH r, sum(br.amount) as totalBudget, count(br) as recordCount
      WITH collect({
        code: r.code,
        description: r.description,
        totalBudget: totalBudget,
        recordCount: recordCount
      }) as regions, sum(totalBudget) as grandTotal
      UNWIND regions as region
      RETURN region.code as regionCode,
             region.description as regionName,
             region.totalBudget as totalBudget,
             region.recordCount as recordCount,
             CASE WHEN grandTotal > 0 THEN (toFloat(region.totalBudget) / grandTotal) * 100 ELSE 0 END as percentage
      ORDER BY totalBudget DESC
    `;

    const results = await this.neo4jService.query<{
      regionCode: string;
      regionName: string;
      totalBudget: number;
      recordCount: number;
      percentage: number;
    }>(cypher, { year, type });

    const allocations: RegionalAllocationDto[] = results.map((item) => ({
      regionCode: item.regionCode,
      regionName: item.regionName,
      totalBudget: item.totalBudget || 0,
      totalBudgetPesos: (item.totalBudget || 0) * 1000,
      recordCount: item.recordCount || 0,
      percentage: item.percentage || 0,
    }));

    // Get breakdown by department if requested
    if (groupByDepartment) {
      for (const allocation of allocations) {
        const deptCypher = `
          MATCH (br:BudgetRecord {fiscal_year: $year, budget_type: $type})-[:LOCATED_IN_REGION]->(r:Region {code: $regionCode})
          MATCH (br)-[:ALLOCATED_TO]->(org:Organization)
          MATCH (d:Department {code: org.department_code})
          WITH d.code as departmentCode,
               d.description as departmentName,
               sum(br.amount) as amount
          RETURN departmentCode, departmentName, amount
          ORDER BY amount DESC
          LIMIT 10
        `;

        const deptResults = await this.neo4jService.query<{
          departmentCode: string;
          departmentName: string;
          amount: number;
        }>(deptCypher, {
          year,
          type,
          regionCode: allocation.regionCode,
        });

        allocation.byDepartment = deptResults.map((dept) => ({
          departmentCode: dept.departmentCode,
          departmentName: dept.departmentName,
          amount: dept.amount,
          amountPesos: dept.amount * 1000,
        }));
      }
    }

    return allocations;
  }
}
