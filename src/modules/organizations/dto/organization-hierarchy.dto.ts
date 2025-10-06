import { ApiProperty } from '@nestjs/swagger';

export class OperatingUnitDto {
  @ApiProperty({ example: '0000000' })
  code: string;

  @ApiProperty({ example: '070500000000' })
  uacsCode: string;

  @ApiProperty({ example: 'DepEd Regional Office VII' })
  description: string;

  @ApiProperty({ example: '01' })
  classCode?: string;

  @ApiProperty({ example: '00000' })
  lowerOuCode?: string;
}

export class AgencyDto {
  @ApiProperty({ example: '705' })
  code: string;

  @ApiProperty({ example: '07050' })
  uacsCode: string;

  @ApiProperty({ example: 'DepEd Region VII' })
  description: string;

  @ApiProperty({ example: '07' })
  departmentCode: string;

  @ApiProperty({ type: [OperatingUnitDto] })
  operatingUnits: OperatingUnitDto[];
}

export class DepartmentHierarchyDto {
  @ApiProperty({ example: '07' })
  code: string;

  @ApiProperty({ example: 'Department of Education' })
  description: string;

  @ApiProperty({ example: 'DepEd' })
  abbreviation?: string;

  @ApiProperty({ type: [AgencyDto] })
  agencies: AgencyDto[];
}

export class OrganizationHierarchyResponseDto {
  @ApiProperty({ type: [DepartmentHierarchyDto] })
  data: DepartmentHierarchyDto[];

  @ApiProperty()
  meta: {
    totalDepartments: number;
    totalAgencies: number;
    totalOperatingUnits: number;
  };
}
