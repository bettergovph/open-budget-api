import { ApiProperty } from '@nestjs/swagger';

export class BudgetTotalResponseDto {
  @ApiProperty({ example: 5234567890 })
  total: number;

  @ApiProperty({ example: 5234567890000 })
  totalInPesos: number;

  @ApiProperty({ example: 'PHP' })
  currency: string;

  @ApiProperty()
  filters: Record<string, any>;
}

export class BudgetByDepartmentDto {
  @ApiProperty({ example: '07' })
  departmentCode: string;

  @ApiProperty({ example: 'Department of Education' })
  departmentName: string;

  @ApiProperty({ example: 800000000 })
  totalBudget: number;

  @ApiProperty({ example: 800000000000 })
  totalBudgetPesos: number;

  @ApiProperty({ example: 50000 })
  recordCount: number;

  @ApiProperty({ example: 15.3 })
  percentage: number;
}
