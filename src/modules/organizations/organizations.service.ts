import { Injectable } from '@nestjs/common';
import { Neo4jService } from '../../database/neo4j/neo4j.service';
import { OrganizationDto } from './dto/organization.dto';
import {
  OrganizationHierarchyResponseDto,
  DepartmentHierarchyDto,
  AgencyDto,
  OperatingUnitDto,
} from './dto/organization-hierarchy.dto';
import { int } from 'neo4j-driver';

@Injectable()
export class OrganizationsService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async searchOrganizations(
    search?: string,
    department?: string,
    withBudget?: boolean,
    year?: string,
    type?: string,
    limit: number = 50,
  ): Promise<OrganizationDto[]> {
    let cypher = `MATCH (org:Organization)`;
    const params: any = { limit: int(limit) };

    // Add filters
    const conditions: string[] = [];
    if (search) {
      conditions.push(`toLower(org.description) CONTAINS toLower($search)`);
      params.search = search;
    }
    if (department) {
      conditions.push(`org.department_code = $department`);
      params.department = department;
    }

    if (conditions.length > 0) {
      cypher += ` WHERE ${conditions.join(' AND ')}`;
    }

    if (withBudget && year && type) {
      cypher += `
        OPTIONAL MATCH (br:BudgetRecord {fiscal_year: $year, budget_type: $type})-[:ALLOCATED_TO]->(org)
        WITH org, sum(br.amount) as totalBudget
        RETURN org.uacs_code as uacsCode,
               org.description as description,
               org.department_code as departmentCode,
               org.department_description as departmentDescription,
               org.agency_code as agencyCode,
               org.agency_description as agencyDescription,
               totalBudget
        ORDER BY totalBudget DESC
        LIMIT $limit
      `;
      params.year = year;
      params.type = type;

      const results = await this.neo4jService.query<{
        uacsCode: string;
        description: string;
        departmentCode: string;
        departmentDescription: string;
        agencyCode: string;
        agencyDescription: string;
        totalBudget: number;
      }>(cypher, params);

      return results.map((item) => {
        const budget = item.totalBudget ? Number(item.totalBudget) : 0;
        return {
          uacsCode: item.uacsCode,
          description: item.description,
          departmentCode: item.departmentCode,
          departmentDescription: item.departmentDescription,
          agencyCode: item.agencyCode,
          agencyDescription: item.agencyDescription,
          totalBudget: budget,
          totalBudgetPesos: budget * 1000,
        };
      });
    } else {
      cypher += `
        RETURN org.uacs_code as uacsCode,
               org.description as description,
               org.department_code as departmentCode,
               org.department_description as departmentDescription,
               org.agency_code as agencyCode,
               org.agency_description as agencyDescription
        ORDER BY org.uacs_code
        LIMIT $limit
      `;

      const results = await this.neo4jService.query<{
        uacsCode: string;
        description: string;
        departmentCode: string;
        departmentDescription: string;
        agencyCode: string;
        agencyDescription: string;
      }>(cypher, params);

      return results.map((item) => ({
        uacsCode: item.uacsCode,
        description: item.description,
        departmentCode: item.departmentCode,
        departmentDescription: item.departmentDescription,
        agencyCode: item.agencyCode,
        agencyDescription: item.agencyDescription,
      }));
    }
  }

  async getOrganizationByCode(
    code: string,
    withBudget?: boolean,
    year?: string,
    type?: string,
  ): Promise<OrganizationDto | null> {
    let cypher = `MATCH (org:Organization {uacs_code: $code})`;

    if (withBudget && year && type) {
      cypher += `
        OPTIONAL MATCH (br:BudgetRecord {fiscal_year: $year, budget_type: $type})-[:ALLOCATED_TO]->(org)
        WITH org, sum(br.amount) as totalBudget
        RETURN org.uacs_code as uacsCode,
               org.description as description,
               org.department_code as departmentCode,
               org.department_description as departmentDescription,
               org.agency_code as agencyCode,
               org.agency_description as agencyDescription,
               totalBudget
      `;

      const result = await this.neo4jService.querySingle<{
        uacsCode: string;
        description: string;
        departmentCode: string;
        departmentDescription: string;
        agencyCode: string;
        agencyDescription: string;
        totalBudget: number;
      }>(cypher, { code, year, type });

      if (!result) return null;

      const budget = result.totalBudget ? Number(result.totalBudget) : 0;
      return {
        uacsCode: result.uacsCode,
        description: result.description,
        departmentCode: result.departmentCode,
        departmentDescription: result.departmentDescription,
        agencyCode: result.agencyCode,
        agencyDescription: result.agencyDescription,
        totalBudget: budget,
        totalBudgetPesos: budget * 1000,
      };
    } else {
      cypher += `
        RETURN org.uacs_code as uacsCode,
               org.description as description,
               org.department_code as departmentCode,
               org.department_description as departmentDescription,
               org.agency_code as agencyCode,
               org.agency_description as agencyDescription
      `;

      const result = await this.neo4jService.querySingle<{
        uacsCode: string;
        description: string;
        departmentCode: string;
        departmentDescription: string;
        agencyCode: string;
        agencyDescription: string;
      }>(cypher, { code });

      if (!result) return null;

      return {
        uacsCode: result.uacsCode,
        description: result.description,
        departmentCode: result.departmentCode,
        departmentDescription: result.departmentDescription,
        agencyCode: result.agencyCode,
        agencyDescription: result.agencyDescription,
      };
    }
  }

  async getOrganizationHierarchy(): Promise<OrganizationHierarchyResponseDto> {
    // Get all departments with their agencies and operating units
    const cypher = `
      MATCH (d:Department)
      OPTIONAL MATCH (d)-[:HAS_AGENCY]->(a:Agency)
      OPTIONAL MATCH (a)-[:HAS_OPERATING_UNIT]->(ou:OperatingUnit)
      RETURN d.code as deptCode,
             d.description as deptDescription,
             d.abbreviation as deptAbbreviation,
             collect(DISTINCT {
               code: a.code,
               uacsCode: a.uacs_code,
               description: a.description,
               departmentCode: a.department_code
             }) as agencies,
             collect(DISTINCT {
               code: ou.code,
               uacsCode: ou.uacs_code,
               description: ou.description,
               classCode: ou.class_code,
               lowerOuCode: ou.lower_ou_code,
               agencyCode: substring(ou.uacs_code, 2, 3)
             }) as operatingUnits
      ORDER BY d.code
    `;

    const results = await this.neo4jService.query<{
      deptCode: string;
      deptDescription: string;
      deptAbbreviation: string;
      agencies: Array<{
        code: string;
        uacsCode: string;
        description: string;
        departmentCode: string;
      }>;
      operatingUnits: Array<{
        code: string;
        uacsCode: string;
        description: string;
        classCode: string;
        lowerOuCode: string;
        agencyCode: string;
      }>;
    }>(cypher);

    let totalAgencies = 0;
    let totalOperatingUnits = 0;

    const departments: DepartmentHierarchyDto[] = results.map((dept) => {
      // Group operating units by agency
      const ouByAgency = new Map<string, OperatingUnitDto[]>();

      dept.operatingUnits
        .filter((ou) => ou.code && ou.uacsCode)
        .forEach((ou) => {
          const agencyCode = ou.agencyCode;
          if (!ouByAgency.has(agencyCode)) {
            ouByAgency.set(agencyCode, []);
          }
          ouByAgency.get(agencyCode)!.push({
            code: ou.code,
            uacsCode: ou.uacsCode,
            description: ou.description,
            classCode: ou.classCode,
            lowerOuCode: ou.lowerOuCode,
          });
        });

      const agencies: AgencyDto[] = dept.agencies
        .filter((a) => a.code && a.uacsCode)
        .map((agency) => {
          const agencyOUs = ouByAgency.get(agency.code) || [];
          totalOperatingUnits += agencyOUs.length;
          return {
            code: agency.code,
            uacsCode: agency.uacsCode,
            description: agency.description,
            departmentCode: agency.departmentCode,
            operatingUnits: agencyOUs,
          };
        });

      totalAgencies += agencies.length;

      return {
        code: dept.deptCode,
        description: dept.deptDescription,
        abbreviation: dept.deptAbbreviation,
        agencies,
      };
    });

    return {
      data: departments,
      meta: {
        totalDepartments: departments.length,
        totalAgencies,
        totalOperatingUnits,
      },
    };
  }
}
