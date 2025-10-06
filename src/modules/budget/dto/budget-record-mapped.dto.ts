import { ApiProperty } from '@nestjs/swagger';

export class BudgetRecordMappedDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  fiscalYear: string;

  @ApiProperty()
  budgetType: string;

  @ApiProperty()
  amount: number;

  @ApiProperty()
  amountPesos: number;

  @ApiProperty()
  description: string;

  @ApiProperty()
  organization: {
    uacsCode: string;
    description: string;
    department: {
      code: string;
      description: string;
    };
    agency: {
      code: string;
      description: string;
    } | null;
    operatingUnit: {
      code: string;
      description: string;
    } | null;
  };

  @ApiProperty()
  location: {
    region: {
      code: string;
      description: string;
    };
    province?: {
      code: string;
      description: string;
    } | null;
    city?: {
      code: string;
      description: string;
    } | null;
  } | null;

  @ApiProperty()
  fundingSource: {
    uacsCode: string;
    description: string;
    fundCluster: {
      code: string;
      description: string;
    } | null;
    financingSource: {
      code: string;
      description: string;
    } | null;
  } | null;

  @ApiProperty()
  expenseClassification: {
    subObject: {
      uacsCode: string;
      description: string;
    };
    category: {
      code: string;
      description: string;
    } | null;
  } | null;
}

export class BudgetRecordsMappedResponseDto {
  @ApiProperty({ type: [BudgetRecordMappedDto] })
  data: BudgetRecordMappedDto[];

  @ApiProperty()
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
