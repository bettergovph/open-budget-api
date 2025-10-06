import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { ExpenseCategoriesService } from './expense-categories.service';
import {
  ExpenseCategoryDto,
  BudgetByExpenseCategoryDto,
} from './dto/expense-category.dto';

@ApiTags('expense-categories')
@Controller('expense-categories')
export class ExpenseCategoriesController {
  constructor(
    private readonly expenseCategoriesService: ExpenseCategoriesService,
  ) {}

  @Get()
  @ApiOperation({
    summary:
      'Get expense classifications with optional hierarchical NEP/GAA budget data',
    description: `Returns expense classifications. If year is provided, returns full hierarchy (Classification → SubClass → Group → Object) with NEP and GAA budgets at each level. Without year, returns basic classification list.`,
  })
  @ApiQuery({
    name: 'year',
    required: false,
    type: String,
    description:
      'Fiscal year (e.g., "2025"). If provided, returns hierarchical structure with NEP/GAA budgets',
    example: '2025',
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns expense classifications with optional budget hierarchy',
    schema: {
      oneOf: [
        {
          type: 'array',
          description: 'Without year parameter - basic classification list',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string', example: '1' },
              description: { type: 'string', example: 'Personal Services' },
            },
          },
        },
        {
          type: 'array',
          description:
            'With year parameter - hierarchical structure with NEP/GAA budgets',
          items: {
            type: 'object',
            properties: {
              code: { type: 'string', example: '1' },
              description: { type: 'string', example: 'Personal Services' },
              nep: {
                type: 'object',
                properties: {
                  amount: { type: 'number', example: 450000000 },
                  amountPesos: { type: 'number', example: 450000000000 },
                },
              },
              gaa: {
                type: 'object',
                properties: {
                  amount: { type: 'number', example: 460000000 },
                  amountPesos: { type: 'number', example: 460000000000 },
                },
              },
              subClasses: {
                type: 'array',
                items: {
                  type: 'object',
                  properties: {
                    code: { type: 'string' },
                    description: { type: 'string' },
                    nep: { type: 'object' },
                    gaa: { type: 'object' },
                    groups: { type: 'array' },
                  },
                },
              },
            },
          },
        },
      ],
    },
  })
  async getAllExpenseCategories(@Query('year') year?: string): Promise<any> {
    return this.expenseCategoriesService.getAllExpenseCategories(year);
  }

  @Get('budget')
  @ApiOperation({ summary: 'Get budget breakdown by expense category' })
  @ApiResponse({
    status: 200,
    description: 'Returns budget aggregated by expense category',
    type: [BudgetByExpenseCategoryDto],
  })
  async getBudgetByExpenseCategory(
    @Query('year') year: string,
    @Query('type') type: string,
    @Query('includeSubObjects') includeSubObjects?: string,
  ): Promise<BudgetByExpenseCategoryDto[]> {
    const includeSub = includeSubObjects === 'true';
    return this.expenseCategoriesService.getBudgetByExpenseCategory(
      year,
      type,
      includeSub,
    );
  }
}
