export type BudgetChangeStatus = 'Increased' | 'Decreased' | 'No Change';

export interface Money {
  amount: number; // amounts in thousands
  amountPesos: number; // amount * 1000
}

/* ---------- Agencies ---------- */
export interface Agency {
  code: string;
  description: string;
  uacsCode: string;
  gaaBudget?: number;
  nepBudget?: number;
  nep?: Money; // present only when year is provided
  gaa?: Money; // present only when year is provided
}

/* ---------- Operating Unit Classes ---------- */
export interface OperatingUnitClass {
  code: string;
  description: string;
  status: string;
  operatingUnitCount: number;
  gaaBudget?: number;
  nepBudget?: number;
  nep?: Money; // with year
  gaa?: Money; // with year
}

/* ---------- Budget Comparison (with year) ---------- */
export interface BudgetDifference {
  amount: number;
  amountPesos: number;
  percentChange: number;
  status: BudgetChangeStatus;
}

export interface BudgetComparison {
  nep: Money;
  gaa: Money;
  difference: BudgetDifference;
}

/* ---------- Regions (with year) ---------- */
export interface RegionBudget {
  code: string;
  description: string;
  nep: Money;
  gaa: Money;
  difference: number;
  differencePesos: number;
  percentChange: number;
}

export interface RegionsBudget {
  code: string;
  description: string;
  nepBudget: number;
  gaaBudget: number;
}

/* ---------- Funding Sources (with year) ---------- */
export interface FundingSourceBudget {
  uacsCode: string;
  description: string;
  fundClusterCode: string;
  nep: Money;
  gaa: Money;
  difference: number;
  differencePesos: number;
  percentChange: number;
}

export interface FundingSourcesBudget {
  uacsCode: string;
  description: string;
  fundClusterCode: string;
  nepBudget: number;
  gaaBudget: number;
}

/* ---------- Expense Classification Hierarchy (with year) ---------- */
export interface ExpenseObject {
  code: string;
  description: string;
  nep: Money;
  gaa: Money;
}

export interface ExpenseGroup {
  code: string;
  description: string;
  nep: Money;
  gaa: Money;
  objects: ExpenseObject[];
}

export interface ExpenseSubClass {
  code: string;
  description: string;
  nep: Money;
  gaa: Money;
  groups: ExpenseGroup[];
}

export interface ExpenseClassification {
  code: string;
  description: string;
  nep: Money;
  gaa: Money;
  subClasses: ExpenseSubClass[];
}

export interface ExpenseClassification {
  code: string;
  description: string;
  nep: Money;
  gaa: Money;
  subClasses: ExpenseSubClass[];
}

/* ---------- Projects (with year) ---------- */
export interface Project {
  prexcFpapId: string;
  description: string;
  nep: Money;
  gaa: Money;
}

/* ---------- Statistics ---------- */
export interface DepartmentStatistics {
  totalAgencies: number;
  totalOperatingUnitClasses: number;
  totalRegions: number;
  totalFundingSources: number;
  totalExpenseClassifications: number;
  totalProjects: number;
}

export interface GaaNepData {
  nepTotal: number;
  gaaTotal: number;
}

/* ---------- Root ---------- */
export interface DepartmentDetails {
  code: string;
  description: string;
  abbreviation: string;

  agencies: Agency[];
  operatingUnitClasses: OperatingUnitClass[];

  // present only when year is provided
  budgetComparison?: BudgetComparison;
  regions?: RegionBudget[];
  fundingSources?: FundingSourceBudget[];
  expenseClassifications?: ExpenseClassification[];
  projects?: Project[];
  statistics: DepartmentStatistics;
}
