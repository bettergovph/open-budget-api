import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

export class FinancingSourceDTO {
  @ApiProperty({ example: '10' })
  @IsString()
  code!: string;

  @ApiProperty({ example: 'Domestic' })
  @IsString()
  description!: string;
}

export class AuthorizationDTO {
  @ApiProperty({ example: '11' })
  @IsString()
  code!: string;

  @ApiProperty({ example: 'RA/GA Act' })
  @IsString()
  description!: string;
}

export class FundCategoryDTO {
  @ApiProperty({ example: '011011010000' })
  @IsString()
  uacsCode!: string;

  @ApiProperty({ example: 'Specific Budgets of NGAs – Category A' })
  @IsString()
  description!: string;
}

export class FundingSourceEntryDTO {
  @ApiPropertyOptional({ example: '01101101' })
  @IsOptional()
  @IsString()
  uacsCode?: string;

  @ApiPropertyOptional({
    example: 'Specific Budgets of National Government Agencies',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    example: '01',
    description: 'From fs.fund_cluster_code',
  })
  @IsOptional()
  @IsString()
  fundClusterCode?: string;

  @ApiPropertyOptional({
    example: '10',
    description: 'From fs.financing_source_code',
  })
  @IsOptional()
  @IsString()
  financingSourceCode?: string;

  @ApiPropertyOptional({ type: FinancingSourceDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => FinancingSourceDTO)
  financingSource?: FinancingSourceDTO;

  @ApiPropertyOptional({ type: AuthorizationDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => AuthorizationDTO)
  authorization?: AuthorizationDTO;

  @ApiPropertyOptional({ type: FundCategoryDTO })
  @IsOptional()
  @ValidateNested()
  @Type(() => FundCategoryDTO)
  fundCategory?: FundCategoryDTO;
}

export class FundingClusterTreeDTO {
  @ApiProperty({ example: '01' })
  @IsString()
  clusterCode!: string;

  @ApiProperty({ example: 'General Fund' })
  @IsString()
  clusterDescription!: string;

  @ApiProperty({ type: [FundingSourceEntryDTO] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FundingSourceEntryDTO)
  fundingSources!: FundingSourceEntryDTO[];
}
