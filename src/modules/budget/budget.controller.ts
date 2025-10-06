import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiQuery } from '@nestjs/swagger';
import { BudgetService } from './budget.service';
import { QueryBudgetDto } from './dto/query-budget.dto';
import {
  BudgetTotalResponseDto,
  BudgetByDepartmentDto,
} from './dto/budget-response.dto';
import {
  NepGaaComparisonDto,
  BudgetByDepartmentAllDto,
} from './dto/budget-comparison.dto';
import { BudgetRecordsMappedResponseDto } from './dto/budget-record-mapped.dto';

@ApiTags('budget')
@Controller('budget')
export class BudgetController {
  constructor(private readonly budgetService: BudgetService) {}

  @Get('total')
  @ApiOperation({ summary: 'Get total budget amount for given filters' })
  @ApiResponse({
    status: 200,
    description: 'Returns total budget amount',
    type: BudgetTotalResponseDto,
  })
  async getBudgetTotal(
    @Query() query: QueryBudgetDto,
  ): Promise<BudgetTotalResponseDto> {
    return this.budgetService.getBudgetTotal(query);
  }

  @Get('by-department')
  @ApiOperation({ summary: 'Get budget aggregated by department' })
  @ApiQuery({ name: 'year', required: true, type: String })
  @ApiQuery({ name: 'type', required: true, type: String })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Returns budget breakdown by department',
    type: [BudgetByDepartmentDto],
  })
  async getBudgetByDepartment(
    @Query('year') year: string,
    @Query('type') type: string,
    @Query('limit') limit?: number,
  ): Promise<BudgetByDepartmentDto[]> {
    return this.budgetService.getBudgetByDepartment(
      year,
      type,
      limit ? parseInt(limit.toString()) : 20,
    );
  }

  @Get('by-department-all')
  @ApiOperation({
    summary: 'Get budget by all departments with optional NEP & GAA comparison',
  })
  @ApiQuery({ name: 'year', required: true, type: String })
  @ApiQuery({ name: 'includeNepGaa', required: false, type: String })
  @ApiResponse({
    status: 200,
    description:
      'Returns budget breakdown by department with NEP/GAA comparison',
    type: [BudgetByDepartmentAllDto],
  })
  async getBudgetByDepartmentAll(
    @Query('year') year: string,
    @Query('includeNepGaa') includeNepGaa?: string,
  ): Promise<BudgetByDepartmentAllDto[]> {
    const includeBoth = includeNepGaa === 'true';
    return this.budgetService.getBudgetByDepartmentAll(year, includeBoth);
  }

  @Get('compare-nep-gaa')
  @ApiOperation({ summary: 'Compare NEP vs GAA budget' })
  @ApiQuery({ name: 'year', required: true, type: String })
  @ApiQuery({ name: 'department', required: false, type: String })
  @ApiResponse({
    status: 200,
    description: 'Returns NEP vs GAA comparison',
    type: NepGaaComparisonDto,
  })
  async compareNepVsGaa(
    @Query('year') year: string,
    @Query('department') department?: string,
  ): Promise<NepGaaComparisonDto> {
    return this.budgetService.compareNepVsGaa(year, department);
  }

  @Get('summary')
  @ApiOperation({
    summary: 'Get budget summary with year-over-year comparison and statistics',
  })
  @ApiQuery({ name: 'year', required: true, type: String })
  @ApiResponse({
    status: 200,
    description:
      'Returns budget summary including NEP/GAA totals for selected year, previous year, next year, with comparisons and statistics',
  })
  async getBudgetSummary(@Query('year') year: string): Promise<any> {
    return this.budgetService.getBudgetSummary(year);
  }

  @Get('records-mapped')
  @ApiOperation({
    summary: 'Get budget records with all UACS data mapped',
  })
  @ApiQuery({ name: 'year', required: true, type: String })
  @ApiQuery({ name: 'type', required: true, type: String })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiResponse({
    status: 200,
    description: 'Returns budget records with complete UACS mappings',
    type: BudgetRecordsMappedResponseDto,
  })
  async getBudgetRecordsMapped(
    @Query('year') year: string,
    @Query('type') type: string,
    @Query('page') page?: number,
    @Query('limit') limit?: number,
  ): Promise<BudgetRecordsMappedResponseDto> {
    return this.budgetService.getBudgetRecordsMapped(
      year,
      type,
      page ? parseInt(page.toString()) : 1,
      limit ? parseInt(limit.toString()) : 50,
    );
  }
}
