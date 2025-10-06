import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ExpenseCategoryDto {
  @ApiProperty({ example: '5' })
  code: string;

  @ApiProperty({ example: 'Capital Outlays' })
  description: string;

  @ApiPropertyOptional({ example: 200000000 })
  totalBudget?: number;

  @ApiPropertyOptional({ example: 200000000000 })
  totalBudgetPesos?: number;

  @ApiPropertyOptional({ example: 25.5 })
  percentage?: number;

  @ApiPropertyOptional({ example: 15000 })
  recordCount?: number;
}

export class BudgetByExpenseCategoryDto {
  @ApiProperty({ example: '5' })
  categoryCode: string;

  @ApiProperty({ example: 'Capital Outlays' })
  categoryName: string;

  @ApiProperty({ example: 200000000 })
  totalBudget: number;

  @ApiProperty({ example: 200000000000 })
  totalBudgetPesos: number;

  @ApiProperty({ example: 25.5 })
  percentOfTotalBudget: number;

  @ApiProperty({ example: 210000000 })
  totalBudgetGaa: number;

  @ApiProperty({ example: 210000000000 })
  totalBudgetGaaPesos: number;

  @ApiProperty({ example: 5.0 })
  percentDifferenceNepGaa: number;

  @ApiProperty({ example: 15000 })
  recordCount: number;

  @ApiPropertyOptional()
  topSubObjects?: Array<{
    uacsCode: string;
    description: string;
    amount: number;
    amountPesos: number;
  }>;
}
