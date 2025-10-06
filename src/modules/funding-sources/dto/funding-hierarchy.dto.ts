import { ApiProperty } from '@nestjs/swagger';

export class FundCategoryDto {
  @ApiProperty()
  uacsCode: string;

  @ApiProperty()
  description: string;
}

export class AuthorizationDto {
  @ApiProperty()
  code: string;

  @ApiProperty()
  description: string;
}

export class FinancingSourceDto {
  @ApiProperty()
  code: string;

  @ApiProperty()
  description: string;
}

export class FundClusterHierarchyDto {
  @ApiProperty()
  code: string;

  @ApiProperty()
  description: string;

  @ApiProperty({ type: [Object] })
  fundingSources: Array<{
    uacsCode: string;
    description: string;
    fundClusterCode: string;
    financingSourceCode: string;
    financingSource: FinancingSourceDto;
    authorization: AuthorizationDto;
    fundCategory: FundCategoryDto;
  }>;
}

export class FundingHierarchyResponseDto {
  @ApiProperty({ type: [FundClusterHierarchyDto] })
  data: FundClusterHierarchyDto[];

  @ApiProperty()
  meta: {
    totalFundClusters: number;
    totalFundingSources: number;
    totalFinancingSources: number;
    totalAuthorizations: number;
  };
}
