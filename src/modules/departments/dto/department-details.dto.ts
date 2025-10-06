import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MoneyDto {
  @ApiProperty({ example: 123456 })
  @IsNumber()
  amount!: number;

  @ApiProperty({ example: 123456000 })
  @IsNumber()
  amountPesos!: number;
}

/* ---------- Agencies ---------- */
export class AgencyDto {
  @ApiProperty({ example: '001' })
  @IsString()
  code!: string;

  @ApiProperty({ example: 'Office of the Secretary' })
  @IsString()
  description!: string;

  @ApiProperty({ example: '07001' })
  @IsString()
  uacsCode!: string;

  @ApiPropertyOptional({ type: () => MoneyDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => MoneyDto)
  nep?: MoneyDto;

  @ApiPropertyOptional({ type: () => MoneyDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => MoneyDto)
  gaa?: MoneyDto;
}

/* ---------- Operating Unit Classes ---------- */
export class OperatingUnitClassDto {
  @ApiProperty({ example: '01' })
  @IsString()
  code!: string;

  @ApiProperty({ example: 'Department-wide' })
  @IsString()
  description!: string;

  @ApiProperty({ example: 'Active' })
  @IsString()
  status!: string;

  @ApiProperty({ example: 42 })
  @IsNumber()
  operatingUnitCount!: number;

  @ApiPropertyOptional({ type: () => MoneyDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => MoneyDto)
  nep?: MoneyDto;

  @ApiPropertyOptional({ type: () => MoneyDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => MoneyDto)
  gaa?: MoneyDto;
}

/* ---------- Budget Comparison ---------- */
export enum BudgetChangeStatus {
  Increased = 'Increased',
  Decreased = 'Decreased',
  NoChange = 'No Change',
}

export class BudgetDifferenceDto {
  @ApiProperty({ example: 1000 })
  @IsNumber()
  amount!: number;

  @ApiProperty({ example: 1000000 })
  @IsNumber()
  amountPesos!: number;

  @ApiProperty({ example: 12.34 })
  @IsNumber()
  percentChange!: number;

  @ApiProperty({ enum: BudgetChangeStatus })
  @IsEnum(BudgetChangeStatus)
  status!: BudgetChangeStatus;
}

export class BudgetComparisonDto {
  @ApiProperty({ type: () => MoneyDto })
  @ValidateNested()
  @Type(() => MoneyDto)
  nep!: MoneyDto;

  @ApiProperty({ type: () => MoneyDto })
  @ValidateNested()
  @Type(() => MoneyDto)
  gaa!: MoneyDto;

  @ApiProperty({ type: () => BudgetDifferenceDto })
  @ValidateNested()
  @Type(() => BudgetDifferenceDto)
  difference!: BudgetDifferenceDto;
}

/* ---------- Regions ---------- */
export class RegionDto {
  @ApiProperty({ example: '06' })
  @IsString()
  code!: string;

  @ApiProperty({ example: 'Western Visayas' })
  @IsString()
  description!: string;

  @ApiProperty({ type: () => MoneyDto })
  @ValidateNested()
  @Type(() => MoneyDto)
  nep!: MoneyDto;

  @ApiProperty({ type: () => MoneyDto })
  @ValidateNested()
  @Type(() => MoneyDto)
  gaa!: MoneyDto;

  @ApiProperty({ example: 500 })
  @IsNumber()
  difference!: number;

  @ApiProperty({ example: 500000 })
  @IsNumber()
  differencePesos!: number;

  @ApiProperty({ example: 8.9 })
  @IsNumber()
  percentChange!: number;
}

/* ---------- Funding Sources ---------- */
export class FundingSourceDto {
  @ApiProperty({ example: '01101101' })
  @IsString()
  uacsCode!: string;

  @ApiProperty({ example: 'Specific Budgets of NGAs' })
  @IsString()
  description!: string;

  @ApiProperty({ example: '01' })
  @IsString()
  fundClusterCode!: string;

  @ApiProperty({ type: () => MoneyDto })
  @ValidateNested()
  @Type(() => MoneyDto)
  nep!: MoneyDto;

  @ApiProperty({ type: () => MoneyDto })
  @ValidateNested()
  @Type(() => MoneyDto)
  gaa!: MoneyDto;

  @ApiProperty({ example: 100 })
  @IsNumber()
  difference!: number;

  @ApiProperty({ example: 100000 })
  @IsNumber()
  differencePesos!: number;

  @ApiProperty({ example: 0.75 })
  @IsNumber()
  percentChange!: number;
}

/* ---------- Expense Classification Hierarchy ---------- */
export class ExpenseObjectDto {
  @ApiProperty({ example: '702' })
  @IsString()
  code!: string;

  @ApiProperty({ example: 'Training Expenses' })
  @IsString()
  description!: string;

  @ApiProperty({ type: () => MoneyDto })
  @ValidateNested()
  @Type(() => MoneyDto)
  nep!: MoneyDto;

  @ApiProperty({ type: () => MoneyDto })
  @ValidateNested()
  @Type(() => MoneyDto)
  gaa!: MoneyDto;
}

export class ExpenseGroupDto {
  @ApiProperty({ example: '70' })
  @IsString()
  code!: string;

  @ApiProperty({ example: 'MOOE' })
  @IsString()
  description!: string;

  @ApiProperty({ type: () => MoneyDto })
  @ValidateNested()
  @Type(() => MoneyDto)
  nep!: MoneyDto;

  @ApiProperty({ type: () => MoneyDto })
  @ValidateNested()
  @Type(() => MoneyDto)
  gaa!: MoneyDto;

  @ApiProperty({ type: () => [ExpenseObjectDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpenseObjectDto)
  objects!: ExpenseObjectDto[];
}

export class ExpenseSubClassDto {
  @ApiProperty({ example: '701' })
  @IsString()
  code!: string;

  @ApiProperty({ example: 'Traveling Expenses' })
  @IsString()
  description!: string;

  @ApiProperty({ type: () => MoneyDto })
  @ValidateNested()
  @Type(() => MoneyDto)
  nep!: MoneyDto;

  @ApiProperty({ type: () => MoneyDto })
  @ValidateNested()
  @Type(() => MoneyDto)
  gaa!: MoneyDto;

  @ApiProperty({ type: () => [ExpenseGroupDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpenseGroupDto)
  groups!: ExpenseGroupDto[];
}

export class ExpenseClassificationDto {
  @ApiProperty({ example: '70' })
  @IsString()
  code!: string;

  @ApiProperty({ example: 'Maintenance and Other Operating Expenses' })
  @IsString()
  description!: string;

  @ApiProperty({ type: () => MoneyDto })
  @ValidateNested()
  @Type(() => MoneyDto)
  nep!: MoneyDto;

  @ApiProperty({ type: () => MoneyDto })
  @ValidateNested()
  @Type(() => MoneyDto)
  gaa!: MoneyDto;

  @ApiProperty({ type: () => [ExpenseSubClassDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpenseSubClassDto)
  subClasses!: ExpenseSubClassDto[];
}

/* ---------- Projects (with year) ---------- */
export class ProjectDto {
  @ApiProperty({ example: '310400100002000' })
  @IsString()
  prexcFpapId!: string;

  @ApiProperty({
    example: 'Operation of Schools - Elementary (Kinder to Grade 6)',
  })
  @IsString()
  description!: string;

  @ApiProperty({ type: () => MoneyDto })
  @ValidateNested()
  @Type(() => MoneyDto)
  nep!: MoneyDto;

  @ApiProperty({ type: () => MoneyDto })
  @ValidateNested()
  @Type(() => MoneyDto)
  gaa!: MoneyDto;
}

/* ---------- Statistics ---------- */
export class DepartmentStatisticsDto {
  @ApiProperty({ example: 5 })
  @IsNumber()
  totalAgencies!: number;

  @ApiProperty({ example: 3 })
  @IsNumber()
  totalOperatingUnitClasses!: number;

  @ApiProperty({ example: 17 })
  @IsNumber()
  totalRegions!: number;

  @ApiProperty({ example: 4 })
  @IsNumber()
  totalFundingSources!: number;

  @ApiProperty({ example: 6 })
  @IsNumber()
  totalExpenseClassifications!: number;

  @ApiProperty({ example: 12 })
  @IsNumber()
  totalProjects!: number;
}

/* ---------- Root ---------- */
export class DepartmentDetailsDto {
  @ApiProperty({ example: '07' })
  @IsString()
  code!: string;

  @ApiProperty({ example: 'Department of Education (DepEd)' })
  @IsString()
  description!: string;

  @ApiProperty({ example: 'DepEd' })
  @IsString()
  abbreviation!: string;

  @ApiProperty({ type: () => [AgencyDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => AgencyDto)
  agencies!: AgencyDto[];

  @ApiProperty({ type: () => [OperatingUnitClassDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => OperatingUnitClassDto)
  operatingUnitClasses!: OperatingUnitClassDto[];

  @ApiPropertyOptional({ type: () => BudgetComparisonDto })
  @IsOptional()
  @ValidateNested()
  @Type(() => BudgetComparisonDto)
  budgetComparison?: BudgetComparisonDto;

  @ApiPropertyOptional({ type: () => [RegionDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RegionDto)
  regions?: RegionDto[];

  @ApiPropertyOptional({ type: () => [FundingSourceDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => FundingSourceDto)
  fundingSources?: FundingSourceDto[];

  @ApiPropertyOptional({ type: () => [ExpenseClassificationDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExpenseClassificationDto)
  expenseClassifications?: ExpenseClassificationDto[];

  @ApiPropertyOptional({ type: () => [ProjectDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProjectDto)
  projects?: ProjectDto[];

  @ApiProperty({ type: () => DepartmentStatisticsDto })
  @ValidateNested()
  @Type(() => DepartmentStatisticsDto)
  statistics!: DepartmentStatisticsDto;
}
