import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RegionDto {
  @ApiProperty({ example: '13' })
  code: string;

  @ApiProperty({ example: 'National Capital Region (NCR)' })
  description: string;

  @ApiPropertyOptional({ example: 500000000 })
  totalBudget?: number;

  @ApiPropertyOptional({ example: 500000000000 })
  totalBudgetPesos?: number;

  @ApiPropertyOptional({ example: 15.5 })
  percentOfTotalBudget?: number;

  @ApiPropertyOptional({ example: 520000000 })
  totalBudgetGaa?: number;

  @ApiPropertyOptional({ example: 520000000000 })
  totalBudgetGaaPesos?: number;

  @ApiPropertyOptional({ example: 4.0 })
  percentDifferenceNepGaa?: number;
}

export class RegionalAllocationDto {
  @ApiProperty({ example: '13' })
  regionCode: string;

  @ApiProperty({ example: 'National Capital Region (NCR)' })
  regionName: string;

  @ApiProperty({ example: 500000000 })
  totalBudget: number;

  @ApiProperty({ example: 500000000000 })
  totalBudgetPesos: number;

  @ApiProperty({ example: 15.5 })
  percentage: number;

  @ApiProperty({ example: 25000 })
  recordCount: number;

  @ApiPropertyOptional()
  byDepartment?: Array<{
    departmentCode: string;
    departmentName: string;
    amount: number;
    amountPesos: number;
  }>;
}
