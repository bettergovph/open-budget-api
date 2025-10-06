import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DepartmentDto {
  @ApiProperty({ example: '07' })
  code: string;

  @ApiProperty({ example: 'Department of Education' })
  description: string;

  @ApiPropertyOptional({ example: 800000000 })
  totalBudget?: number;

  @ApiPropertyOptional({ example: 800000000000 })
  totalBudgetPesos?: number;

  @ApiPropertyOptional({ example: 15.5 })
  percentOfTotalBudget?: number;

  @ApiPropertyOptional({ example: 820000000 })
  totalBudgetGaa?: number;

  @ApiPropertyOptional({ example: 820000000000 })
  totalBudgetGaaPesos?: number;

  @ApiPropertyOptional({ example: 2.5 })
  percentDifferenceNepGaa?: number;

  @ApiPropertyOptional({ example: 120 })
  totalAgencies?: number;
}

class AgencyDto {
  @ApiProperty({ example: '705' })
  code: string;

  @ApiProperty({ example: 'DepEd Region VII' })
  description: string;

  @ApiProperty({ example: '07050' })
  uacsCode: string;

  @ApiPropertyOptional({ example: 50000000 })
  budget?: number;

  @ApiPropertyOptional({ example: 50000000000 })
  budgetPesos?: number;
}

class OperatingUnitDto {
  @ApiProperty({ example: '0000000' })
  code: string;

  @ApiProperty({ example: 'DepEd Regional Office VII' })
  description: string;

  @ApiProperty({ example: '070500000000' })
  uacsCode: string;

  @ApiProperty({ example: '705' })
  agencyCode: string;

  @ApiPropertyOptional({ example: 30000000 })
  budget?: number;

  @ApiPropertyOptional({ example: 30000000000 })
  budgetPesos?: number;
}

class RegionSummaryDto {
  @ApiProperty({ example: '07' })
  code: string;

  @ApiProperty({ example: 'Region VII - Central Visayas' })
  description: string;

  @ApiPropertyOptional({ example: 100000000 })
  budget?: number;

  @ApiPropertyOptional({ example: 100000000000 })
  budgetPesos?: number;
}

class FundingSourceSummaryDto {
  @ApiProperty({ example: '01101416' })
  uacsCode: string;

  @ApiProperty({ example: 'Regular Agency Fund' })
  description: string;

  @ApiProperty({ example: '01' })
  fundClusterCode: string;

  @ApiPropertyOptional({ example: 'General Fund' })
  fundClusterDescription?: string;

  @ApiPropertyOptional({ example: 200000000 })
  budget?: number;

  @ApiPropertyOptional({ example: 200000000000 })
  budgetPesos?: number;
}

class ExpenseCategorySummaryDto {
  @ApiProperty({ example: '5020100000' })
  code: string;

  @ApiProperty({ example: 'Personal Services' })
  description: string;

  @ApiPropertyOptional({ example: 150000000 })
  budget?: number;

  @ApiPropertyOptional({ example: 150000000000 })
  budgetPesos?: number;
}

class DepartmentStatisticsDto {
  @ApiProperty({ example: 15 })
  totalAgencies: number;

  @ApiProperty({ example: 120 })
  totalOperatingUnits: number;

  @ApiProperty({ example: 8 })
  totalRegions: number;

  @ApiProperty({ example: 5 })
  totalFundingSources: number;

  @ApiProperty({ example: 4 })
  totalExpenseCategories: number;
}

export class DepartmentDetailDto {
  @ApiProperty({ example: '07' })
  code: string;

  @ApiProperty({ example: 'Department of Education' })
  description: string;

  @ApiPropertyOptional({ example: 'DepEd' })
  abbreviation?: string;

  @ApiPropertyOptional({ example: 800000000 })
  totalBudget?: number;

  @ApiPropertyOptional({ example: 800000000000 })
  totalBudgetPesos?: number;

  @ApiPropertyOptional({
    description: 'Agencies under this department',
    type: [AgencyDto],
  })
  agencies?: AgencyDto[];

  @ApiPropertyOptional({
    description: 'Operating units under this department',
    type: [OperatingUnitDto],
  })
  operatingUnits?: OperatingUnitDto[];

  @ApiPropertyOptional({
    description: 'Regions where this department operates',
    type: [RegionSummaryDto],
  })
  regions?: RegionSummaryDto[];

  @ApiPropertyOptional({
    description: 'Funding sources used by this department',
    type: [FundingSourceSummaryDto],
  })
  fundingSources?: FundingSourceSummaryDto[];

  @ApiPropertyOptional({
    description: 'Expense categories used by this department',
    type: [ExpenseCategorySummaryDto],
  })
  expenseCategories?: ExpenseCategorySummaryDto[];

  @ApiPropertyOptional({
    description: 'Summary statistics',
    type: DepartmentStatisticsDto,
  })
  statistics?: DepartmentStatisticsDto;
}
