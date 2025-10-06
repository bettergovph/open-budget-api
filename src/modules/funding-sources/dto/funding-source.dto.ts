import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FundingSourceDto {
  @ApiProperty({ example: '01010101' })
  uacsCode: string;

  @ApiProperty({ example: 'General Fund' })
  description: string;

  @ApiPropertyOptional({ example: '01' })
  clusterCode?: string;

  @ApiPropertyOptional({ example: 'National Government' })
  clusterDescription?: string;

  @ApiPropertyOptional({ example: 5000000000 })
  totalBudget?: number;

  @ApiPropertyOptional({ example: 5000000000000 })
  totalBudgetPesos?: number;
}
