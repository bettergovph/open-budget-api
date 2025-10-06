import { Injectable } from '@nestjs/common';
import { Neo4jService } from '../../database/neo4j/neo4j.service';
import { QueryBudgetDto } from './dto/query-budget.dto';
import {
  BudgetTotalResponseDto,
  BudgetByDepartmentDto,
} from './dto/budget-response.dto';
import {
  NepGaaComparisonDto,
  BudgetByDepartmentAllDto,
} from './dto/budget-comparison.dto';
import { BudgetRecordsMappedResponseDto } from './dto/budget-record-mapped.dto';
import { int } from 'neo4j-driver';

@Injectable()
export class BudgetService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async getBudgetTotal(query: QueryBudgetDto): Promise<BudgetTotalResponseDto> {
    let cypher = `
      MATCH (br:BudgetRecord {fiscal_year: $year, budget_type: $type})
    `;

    const params: any = {
      year: query.year,
      type: query.type,
    };

    // Add optional filters
    if (query.department) {
      cypher += ` MATCH (br)-[:ALLOCATED_TO]->(org:Organization {department_code: $department})`;
      params.department = query.department;
    }

    if (query.region) {
      cypher += ` MATCH (br)-[:LOCATED_IN_REGION]->(r:Region {code: $region})`;
      params.region = query.region;
    }

    cypher += ` RETURN sum(br.amount) as total`;

    const result = await this.neo4jService.querySingle<{ total: number }>(
      cypher,
      params,
    );

    const total = result?.total || 0;

    return {
      total,
      totalInPesos: total * 1000, // Budget is in thousands
      currency: 'PHP',
      filters: {
        year: query.year,
        type: query.type,
        ...(query.department && { department: query.department }),
        ...(query.region && { region: query.region }),
      },
    };
  }

  async getBudgetByDepartment(
    year: string,
    type: string,
    limit: number = 20,
  ): Promise<BudgetByDepartmentDto[]> {
    const cypher = `
      MATCH (br:BudgetRecord {fiscal_year: $year, budget_type: $type})-[:ALLOCATED_TO]->(org:Organization)
      MATCH (d:Department {code: org.department_code})
      WITH d.code AS departmentCode,
           d.description AS departmentName,
           sum(br.amount) AS totalBudget,
           count(br) AS recordCount
      ORDER BY totalBudget DESC
      LIMIT $limit
      RETURN departmentCode, departmentName, totalBudget, recordCount
    `;

    const results = await this.neo4jService.query<{
      departmentCode: string;
      departmentName: string;
      totalBudget: number;
      recordCount: number;
    }>(cypher, { year, type, limit: int(limit) });

    // Calculate total for percentage
    const grandTotal = results.reduce(
      (sum, item) => sum + Number(item.totalBudget),
      0,
    );

    return results.map((item) => {
      const budget = Number(item.totalBudget);
      return {
        departmentCode: item.departmentCode,
        departmentName: item.departmentName,
        totalBudget: budget,
        totalBudgetPesos: budget * 1000,
        recordCount: Number(item.recordCount),
        percentage: grandTotal > 0 ? (budget / grandTotal) * 100 : 0,
      };
    });
  }

  async getBudgetByDepartmentAll(
    year: string,
    includeNepGaa: boolean = false,
  ): Promise<BudgetByDepartmentAllDto[]> {
    if (!includeNepGaa) {
      // Return GAA only
      const results = await this.getBudgetByDepartment(year, 'GAA', 50);
      return results.map((item) => ({
        departmentCode: item.departmentCode,
        departmentName: item.departmentName,
        percentage: item.percentage,
        gaa: {
          amount: item.totalBudget,
          amountPesos: item.totalBudgetPesos,
          recordCount: item.recordCount,
        },
      }));
    }

    // Get both NEP and GAA
    const cypher = `
      MATCH (d:Department)
      OPTIONAL MATCH (nep:BudgetRecord {fiscal_year: $year, budget_type: 'NEP'})-[:ALLOCATED_TO]->(org1:Organization {department_code: d.code})
      OPTIONAL MATCH (gaa:BudgetRecord {fiscal_year: $year, budget_type: 'GAA'})-[:ALLOCATED_TO]->(org2:Organization {department_code: d.code})
      WITH d.code as departmentCode,
           d.description as departmentName,
           sum(nep.amount) as nepTotal,
           count(nep) as nepCount,
           sum(gaa.amount) as gaaTotal,
           count(gaa) as gaaCount
      WHERE nepTotal > 0 OR gaaTotal > 0
      WITH collect({
        departmentCode: departmentCode,
        departmentName: departmentName,
        nepTotal: COALESCE(nepTotal, 0),
        nepCount: nepCount,
        gaaTotal: COALESCE(gaaTotal, 0),
        gaaCount: gaaCount
      }) as depts, sum(COALESCE(gaaTotal, 0)) as grandTotal
      UNWIND depts as dept
      RETURN dept.departmentCode as departmentCode,
             dept.departmentName as departmentName,
             dept.nepTotal as nepTotal,
             dept.nepCount as nepCount,
             dept.gaaTotal as gaaTotal,
             dept.gaaCount as gaaCount,
             CASE WHEN grandTotal > 0 THEN (toFloat(dept.gaaTotal) / grandTotal) * 100 ELSE 0 END as percentage
      ORDER BY gaaTotal DESC
    `;

    const results = await this.neo4jService.query<{
      departmentCode: string;
      departmentName: string;
      nepTotal: number;
      nepCount: number;
      gaaTotal: number;
      gaaCount: number;
      percentage: number;
    }>(cypher, { year });

    return results.map((item) => {
      const nepTotal = Number(item.nepTotal);
      const gaaTotal = Number(item.gaaTotal);
      const changeAmount = gaaTotal - nepTotal;
      const changePercent = nepTotal > 0 ? (changeAmount / nepTotal) * 100 : 0;

      return {
        departmentCode: item.departmentCode,
        departmentName: item.departmentName,
        percentage: Number(item.percentage),
        nep: {
          amount: nepTotal,
          amountPesos: nepTotal * 1000,
          recordCount: Number(item.nepCount),
        },
        gaa: {
          amount: gaaTotal,
          amountPesos: gaaTotal * 1000,
          recordCount: Number(item.gaaCount),
        },
        changePercent,
        changePesos: changeAmount * 1000,
      };
    });
  }

  async compareNepVsGaa(
    year: string,
    department?: string,
  ): Promise<NepGaaComparisonDto> {
    let cypher = `
      MATCH (nep:BudgetRecord {fiscal_year: $year, budget_type: 'NEP'})
      MATCH (gaa:BudgetRecord {fiscal_year: $year, budget_type: 'GAA'})
    `;

    const params: any = { year };

    if (department) {
      cypher += `
        MATCH (nep)-[:ALLOCATED_TO]->(org1:Organization {department_code: $department})
        MATCH (gaa)-[:ALLOCATED_TO]->(org2:Organization {department_code: $department})
        MATCH (d:Department {code: $department})
      `;
      params.department = department;
    }

    cypher += `
      WITH sum(nep.amount) as nepTotal,
           count(nep) as nepCount,
           sum(gaa.amount) as gaaTotal,
           count(gaa) as gaaCount
           ${department ? ', d.code as deptCode, d.description as deptName' : ''}
      RETURN nepTotal, nepCount, gaaTotal, gaaCount
             ${department ? ', deptCode, deptName' : ''}
    `;

    const result = await this.neo4jService.querySingle<{
      nepTotal: number;
      nepCount: number;
      gaaTotal: number;
      gaaCount: number;
      deptCode?: string;
      deptName?: string;
    }>(cypher, params);

    if (!result) {
      throw new Error('No data found for the specified criteria');
    }

    const nepTotal = Number(result.nepTotal);
    const gaaTotal = Number(result.gaaTotal);
    const difference = (gaaTotal - nepTotal) * 1000;
    const percentageChange =
      nepTotal > 0 ? ((gaaTotal - nepTotal) / nepTotal) * 100 : 0;
    const status =
      percentageChange > 0
        ? 'Increased'
        : percentageChange < 0
          ? 'Decreased'
          : 'No Change';

    return {
      ...(department && {
        departmentCode: result.deptCode,
        departmentName: result.deptName,
      }),
      nep: {
        total: nepTotal,
        totalInPesos: nepTotal * 1000,
        recordCount: Number(result.nepCount),
      },
      gaa: {
        total: gaaTotal,
        totalInPesos: gaaTotal * 1000,
        recordCount: Number(result.gaaCount),
      },
      difference,
      percentageChange,
      status,
    };
  }

  async getBudgetSummary(year: string): Promise<any> {
    // Get selected year NEP and GAA totals
    const selectedYearCypher = `
      MATCH (br:BudgetRecord {fiscal_year: $year})
      WITH sum(CASE WHEN br.budget_type = 'NEP' THEN br.amount ELSE 0 END) as nepTotal,
           sum(CASE WHEN br.budget_type = 'GAA' THEN br.amount ELSE 0 END) as gaaTotal,
           count(DISTINCT CASE WHEN br.budget_type = 'NEP' THEN br END) as nepRecords,
           count(DISTINCT CASE WHEN br.budget_type = 'GAA' THEN br END) as gaaRecords
      RETURN nepTotal, gaaTotal, nepRecords, gaaRecords
    `;

    const selectedYear = await this.neo4jService.querySingle<{
      nepTotal: number;
      gaaTotal: number;
      nepRecords: number;
      gaaRecords: number;
    }>(selectedYearCypher, { year });

    if (!selectedYear) {
      throw new Error(`No budget data found for year ${year}`);
    }

    const nepTotal = Number(selectedYear.nepTotal);
    const gaaTotal = Number(selectedYear.gaaTotal);
    const nepGaaDiff = gaaTotal - nepTotal;
    const nepGaaPercent = nepTotal > 0 ? (nepGaaDiff / nepTotal) * 100 : 0;

    // Get previous year data
    const prevYear = String(Number(year) - 1);
    const prevYearCypher = `
      MATCH (br:BudgetRecord {fiscal_year: $prevYear})
      WITH sum(CASE WHEN br.budget_type = 'NEP' THEN br.amount ELSE 0 END) as nepTotal,
           sum(CASE WHEN br.budget_type = 'GAA' THEN br.amount ELSE 0 END) as gaaTotal
      RETURN nepTotal, gaaTotal
    `;

    const prevYearData = await this.neo4jService.querySingle<{
      nepTotal: number;
      gaaTotal: number;
    }>(prevYearCypher, { prevYear });

    const prevNep = prevYearData ? Number(prevYearData.nepTotal) : 0;
    const prevGaa = prevYearData ? Number(prevYearData.gaaTotal) : 0;

    // Get next year data
    const nextYear = String(Number(year) + 1);
    const nextYearCypher = `
      MATCH (br:BudgetRecord {fiscal_year: $nextYear})
      WITH sum(CASE WHEN br.budget_type = 'NEP' THEN br.amount ELSE 0 END) as nepTotal,
           sum(CASE WHEN br.budget_type = 'GAA' THEN br.amount ELSE 0 END) as gaaTotal
      RETURN nepTotal, gaaTotal
    `;

    const nextYearData = await this.neo4jService.querySingle<{
      nepTotal: number;
      gaaTotal: number;
    }>(nextYearCypher, { nextYear });

    const nextNep = nextYearData ? Number(nextYearData.nepTotal) : 0;
    const nextGaa = nextYearData ? Number(nextYearData.gaaTotal) : 0;

    // Calculate differences and percentages with previous year
    const nepDiffPrev = nepTotal - prevNep;
    const gaaDiffPrev = gaaTotal - prevGaa;
    const nepPercentPrev = prevNep > 0 ? (nepDiffPrev / prevNep) * 100 : 0;
    const gaaPercentPrev = prevGaa > 0 ? (gaaDiffPrev / prevGaa) * 100 : 0;

    // Calculate differences and percentages with next year
    const nepDiffNext = nextNep - nepTotal;
    const gaaDiffNext = nextGaa - gaaTotal;
    const nepPercentNext = nepTotal > 0 ? (nepDiffNext / nepTotal) * 100 : 0;
    const gaaPercentNext = gaaTotal > 0 ? (gaaDiffNext / gaaTotal) * 100 : 0;

    // Get total departments
    const deptCypher = `
      MATCH (d:Department)
      RETURN count(d) as total
    `;

    const deptCount = await this.neo4jService.querySingle<{ total: number }>(
      deptCypher,
    );

    // Get total projects (count distinct prexc_fpap_id for selected year)
    const projectsCypher = `
      MATCH (br:BudgetRecord {fiscal_year: $year})
      WHERE br.prexc_fpap_id IS NOT NULL AND br.prexc_fpap_id <> ''
      RETURN count(DISTINCT br.prexc_fpap_id) as total
    `;

    const projectsCount = await this.neo4jService.querySingle<{
      total: number;
    }>(projectsCypher, { year });

    return {
      selectedYear: {
        year,
        nep: {
          amount: nepTotal,
          amountPesos: nepTotal * 1000,
          recordCount: Number(selectedYear.nepRecords),
        },
        gaa: {
          amount: gaaTotal,
          amountPesos: gaaTotal * 1000,
          recordCount: Number(selectedYear.gaaRecords),
        },
        nepGaaComparison: {
          difference: nepGaaDiff,
          differencePesos: nepGaaDiff * 1000,
          percentChange: Number(nepGaaPercent.toFixed(2)),
          status:
            nepGaaPercent > 0
              ? 'Increased'
              : nepGaaPercent < 0
                ? 'Decreased'
                : 'No Change',
        },
      },
      previousYear: {
        year: prevYear,
        nep: {
          amount: prevNep,
          amountPesos: prevNep * 1000,
        },
        gaa: {
          amount: prevGaa,
          amountPesos: prevGaa * 1000,
        },
        comparisonWithSelected: {
          nepDifference: nepDiffPrev,
          nepDifferencePesos: nepDiffPrev * 1000,
          nepPercentChange: Number(nepPercentPrev.toFixed(2)),
          nepStatus:
            nepPercentPrev > 0
              ? 'Increased'
              : nepPercentPrev < 0
                ? 'Decreased'
                : 'No Change',
          gaaDifference: gaaDiffPrev,
          gaaDifferencePesos: gaaDiffPrev * 1000,
          gaaPercentChange: Number(gaaPercentPrev.toFixed(2)),
          gaaStatus:
            gaaPercentPrev > 0
              ? 'Increased'
              : gaaPercentPrev < 0
                ? 'Decreased'
                : 'No Change',
        },
      },
      nextYear: {
        year: nextYear,
        nep: {
          amount: nextNep,
          amountPesos: nextNep * 1000,
        },
        gaa: {
          amount: nextGaa,
          amountPesos: nextGaa * 1000,
        },
        comparisonWithSelected: {
          nepDifference: nepDiffNext,
          nepDifferencePesos: nepDiffNext * 1000,
          nepPercentChange: Number(nepPercentNext.toFixed(2)),
          nepStatus:
            nepPercentNext > 0
              ? 'Increased'
              : nepPercentNext < 0
                ? 'Decreased'
                : 'No Change',
          gaaDifference: gaaDiffNext,
          gaaDifferencePesos: gaaDiffNext * 1000,
          gaaPercentChange: Number(gaaPercentNext.toFixed(2)),
          gaaStatus:
            gaaPercentNext > 0
              ? 'Increased'
              : gaaPercentNext < 0
                ? 'Decreased'
                : 'No Change',
        },
      },
      statistics: {
        totalDepartments: deptCount ? Number(deptCount.total) : 0,
        totalProjects: projectsCount ? Number(projectsCount.total) : 0,
      },
    };
  }

  async getBudgetRecordsMapped(
    year: string,
    type: string,
    page: number = 1,
    limit: number = 50,
  ): Promise<BudgetRecordsMappedResponseDto> {
    const offset = (page - 1) * limit;

    const cypher = `
      MATCH (br:BudgetRecord {fiscal_year: $year, budget_type: $type})
      MATCH (br)-[:ALLOCATED_TO]->(org:Organization)
      MATCH (d:Department {code: org.department_code})
      OPTIONAL MATCH (d)-[:HAS_AGENCY]->(a:Agency {code: org.agency_code})
      OPTIONAL MATCH (a)-[:HAS_OPERATING_UNIT]->(ou:OperatingUnit)
        WHERE ou.uacs_code = org.uacs_code
      OPTIONAL MATCH (br)-[:LOCATED_IN_REGION]->(r:Region)
      OPTIONAL MATCH (br)-[:LOCATED_IN_PROVINCE]->(prov:Province)
      OPTIONAL MATCH (br)-[:LOCATED_IN_CITY]->(city:CityMunicipality)
      OPTIONAL MATCH (br)-[:FUNDED_BY]->(fs:FundingSource)
      OPTIONAL MATCH (fs)-[:HAS_FUND_CLUSTER]->(fc:FundCluster)
      OPTIONAL MATCH (fs)-[:HAS_FINANCING_SOURCE]->(fin:FinancingSource)
      OPTIONAL MATCH (br)-[:CLASSIFIED_AS]->(so:SubObject)
      OPTIONAL MATCH (so)-[:IN_CATEGORY]->(ec:ExpenseCategory)
      RETURN br, org, d, a, ou, r, prov, city, fs, fc, fin, so, ec
      ORDER BY br.id
      SKIP $offset
      LIMIT $limit
    `;

    const countCypher = `
      MATCH (br:BudgetRecord {fiscal_year: $year, budget_type: $type})
      RETURN count(br) as total
    `;

    const [records, countResult] = await Promise.all([
      this.neo4jService.query(cypher, {
        year,
        type,
        offset: int(offset),
        limit: int(limit),
      }),
      this.neo4jService.querySingle<{ total: number }>(countCypher, {
        year,
        type,
      }),
    ]);

    const data = records.map((record) => ({
      id: record.br.properties.id,
      fiscalYear: record.br.properties.fiscal_year,
      budgetType: record.br.properties.budget_type,
      amount: record.br.properties.amount,
      amountPesos: record.br.properties.amount * 1000,
      description: record.br.properties.description || '',
      organization: {
        uacsCode: record.org.properties.uacs_code,
        description: record.org.properties.description,
        department: {
          code: record.d.properties.code,
          description: record.d.properties.description,
        },
        agency: record.a
          ? {
              code: record.a.properties.code,
              description: record.a.properties.description,
            }
          : null,
        operatingUnit: record.ou
          ? {
              code: record.ou.properties.code,
              description: record.ou.properties.description,
            }
          : null,
      },
      location: record.r
        ? {
            region: {
              code: record.r.properties.code,
              description: record.r.properties.description,
            },
            province: record.prov
              ? {
                  code: record.prov.properties.psgc_code,
                  description: record.prov.properties.description,
                }
              : null,
            city: record.city
              ? {
                  code: record.city.properties.psgc_code,
                  description: record.city.properties.description,
                }
              : null,
          }
        : null,
      fundingSource: record.fs
        ? {
            uacsCode: record.fs.properties.uacs_code,
            description: record.fs.properties.description,
            fundCluster: record.fc
              ? {
                  code: record.fc.properties.code,
                  description: record.fc.properties.description,
                }
              : null,
            financingSource: record.fin
              ? {
                  code: record.fin.properties.code,
                  description: record.fin.properties.description,
                }
              : null,
          }
        : null,
      expenseClassification: record.so
        ? {
            subObject: {
              uacsCode: record.so.properties.uacs_code,
              description: record.so.properties.description,
            },
            category: record.ec
              ? {
                  code: record.ec.properties.code,
                  description: record.ec.properties.description,
                }
              : null,
          }
        : null,
    }));

    const total = countResult?.total ? Number(countResult.total) : 0;

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
