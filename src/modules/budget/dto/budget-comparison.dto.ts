import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class NepGaaComparisonDto {
  @ApiProperty({ example: '07' })
  departmentCode?: string;

  @ApiProperty({ example: 'Department of Education' })
  departmentName?: string;

  @ApiProperty()
  nep: {
    total: number;
    totalInPesos: number;
    recordCount: number;
  };

  @ApiProperty()
  gaa: {
    total: number;
    totalInPesos: number;
    recordCount: number;
  };

  @ApiProperty({ example: -20000000000 })
  difference: number;

  @ApiProperty({ example: -2.5 })
  percentageChange: number;

  @ApiProperty({ example: 'Decreased' })
  status: string;
}

export class BudgetByDepartmentAllDto {
  @ApiProperty({ example: '07' })
  departmentCode: string;

  @ApiProperty({ example: 'Department of Education' })
  departmentName: string;

  @ApiProperty({ example: 15.5 })
  percentage: number;

  @ApiPropertyOptional()
  nep?: {
    amount: number;
    amountPesos: number;
    recordCount: number;
  };

  @ApiPropertyOptional()
  gaa?: {
    amount: number;
    amountPesos: number;
    recordCount: number;
  };

  @ApiPropertyOptional({ example: -2.5 })
  changePercent?: number;

  @ApiPropertyOptional({ example: -20000000000 })
  changePesos?: number;
}
