import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class OrganizationDto {
  @ApiProperty({ example: '070500000000' })
  uacsCode: string;

  @ApiProperty({ example: 'DepEd Regional Office VII' })
  description: string;

  @ApiProperty({ example: '07' })
  departmentCode: string;

  @ApiProperty({ example: 'Department of Education' })
  departmentDescription: string;

  @ApiPropertyOptional({ example: '0705' })
  agencyCode?: string;

  @ApiPropertyOptional({ example: 'DepEd Region VII' })
  agencyDescription?: string;

  @ApiPropertyOptional({ example: 800000000 })
  totalBudget?: number;

  @ApiPropertyOptional({ example: 800000000000 })
  totalBudgetPesos?: number;
}
