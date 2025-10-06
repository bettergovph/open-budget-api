import { Injectable } from '@nestjs/common';
import { Neo4jService } from '../../database/neo4j/neo4j.service';
import { FundingSourceDto } from './dto/funding-source.dto';
import {
  FundClusterHierarchyDto,
  FundingHierarchyResponseDto,
} from './dto/funding-hierarchy.dto';
import { FundingClusterTreeDTO } from './dto/funding-cypher.dto';

@Injectable()
export class FundingSourcesService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async getFundingSourceHierarchy(): Promise<FundingHierarchyResponseDto> {
    const CYPHER = `
    MATCH (fc:FundCluster)
    OPTIONAL MATCH (fs:FundingSource {fund_cluster_code: fc.code})
    OPTIONAL MATCH (fin:FinancingSource {code: fs.financing_source_code})
    OPTIONAL MATCH (auth:Authorization {code: fs.authorization_code})
    OPTIONAL MATCH (fcat:FundCategory {code: fs.fund_category_code})
    RETURN fc.code as clusterCode,
           fc.description as clusterDescription,
           collect(DISTINCT {
             uacsCode: fs.uacs_code,
             description: fs.description,
             fundClusterCode: fs.fund_cluster_code,
             financingSourceCode: fs.financing_source_code,
             authorizationCode: fs.authorization_code,
             fundCategoryCode: fs.fund_category_code,
             financingSource: {
               code: fin.code,
               description: fin.description
             },
             authorization: {
               code: auth.code,
               description: auth.description
             },
             fundCategory: {
               uacsCode: fcat.uacs_code,
               description: fcat.description
             }
           }) as fundingSources
    ORDER BY fc.code
  `;

    const results =
      await this.neo4jService.query<FundingClusterTreeDTO>(CYPHER);

    const clusters: FundClusterHierarchyDto[] = results.map((cluster) => ({
      code: cluster.clusterCode,
      description: cluster.clusterDescription,
      fundingSources: cluster.fundingSources.filter(
        (fs): fs is Required<typeof fs> => fs.uacsCode !== undefined,
      ),
    }));

    const totalFundingSources = clusters.reduce(
      (sum, c) => sum + c.fundingSources.length,
      0,
    );

    return {
      data: clusters,
      meta: {
        totalFundClusters: clusters.length,
        totalFundingSources,
        totalFinancingSources: new Set(
          clusters.flatMap((c) =>
            c.fundingSources.map((fs) => fs.financingSourceCode),
          ),
        ).size,
        totalAuthorizations: 0, // Calculate based on your data
      },
    };
  }

  async getAllFundingSources(
    withBudget?: boolean,
    year?: string,
    type?: string,
  ): Promise<FundingSourceDto[]> {
    let cypher = `MATCH (fs:FundingSource)`;

    if (withBudget && year && type) {
      cypher += `
        OPTIONAL MATCH (br:BudgetRecord {fiscal_year: $year, budget_type: $type})-[:FUNDED_BY]->(fs)
        WITH fs, sum(br.amount) as totalBudget
        RETURN fs.uacs_code as uacsCode,
               fs.description as description,
               fs.cluster_code as clusterCode,
               fs.cluster_description as clusterDescription,
               totalBudget
        ORDER BY totalBudget DESC
      `;

      const results = await this.neo4jService.query<{
        uacsCode: string;
        description: string;
        clusterCode: string;
        clusterDescription: string;
        totalBudget: number;
      }>(cypher, { year, type });

      return results.map((item) => {
        const budget = item.totalBudget ? Number(item.totalBudget) : 0;
        return {
          uacsCode: item.uacsCode,
          description: item.description,
          clusterCode: item.clusterCode,
          clusterDescription: item.clusterDescription,
          totalBudget: budget,
          totalBudgetPesos: budget * 1000,
        };
      });
    } else {
      cypher += `
        RETURN fs.uacs_code as uacsCode,
               fs.description as description,
               fs.cluster_code as clusterCode,
               fs.cluster_description as clusterDescription
        ORDER BY fs.uacs_code
      `;

      const results = await this.neo4jService.query<{
        uacsCode: string;
        description: string;
        clusterCode: string;
        clusterDescription: string;
      }>(cypher);

      return results.map((item) => ({
        uacsCode: item.uacsCode,
        description: item.description,
        clusterCode: item.clusterCode,
        clusterDescription: item.clusterDescription,
      }));
    }
  }

  async getFundingSourceByCode(
    code: string,
    withBudget?: boolean,
    year?: string,
    type?: string,
  ): Promise<FundingSourceDto | null> {
    let cypher = `MATCH (fs:FundingSource {uacs_code: $code})`;

    if (withBudget && year && type) {
      cypher += `
        OPTIONAL MATCH (br:BudgetRecord {fiscal_year: $year, budget_type: $type})-[:FUNDED_BY]->(fs)
        WITH fs, sum(br.amount) as totalBudget
        RETURN fs.uacs_code as uacsCode,
               fs.description as description,
               fs.cluster_code as clusterCode,
               fs.cluster_description as clusterDescription,
               totalBudget
      `;

      const result = await this.neo4jService.querySingle<{
        uacsCode: string;
        description: string;
        clusterCode: string;
        clusterDescription: string;
        totalBudget: number;
      }>(cypher, { code, year, type });

      if (!result) return null;

      const budget = result.totalBudget ? Number(result.totalBudget) : 0;
      return {
        uacsCode: result.uacsCode,
        description: result.description,
        clusterCode: result.clusterCode,
        clusterDescription: result.clusterDescription,
        totalBudget: budget,
        totalBudgetPesos: budget * 1000,
      };
    } else {
      cypher += `
        RETURN fs.uacs_code as uacsCode,
               fs.description as description,
               fs.cluster_code as clusterCode,
               fs.cluster_description as clusterDescription
      `;

      const result = await this.neo4jService.querySingle<{
        uacsCode: string;
        description: string;
        clusterCode: string;
        clusterDescription: string;
      }>(cypher, { code });

      if (!result) return null;

      return {
        uacsCode: result.uacsCode,
        description: result.description,
        clusterCode: result.clusterCode,
        clusterDescription: result.clusterDescription,
      };
    }
  }
}
