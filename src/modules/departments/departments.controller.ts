import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import {
  DepartmentDto,
  DepartmentDetailDto,
} from './dto/department-response.dto';

@ApiTags('departments')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List all departments' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of all departments',
    type: [DepartmentDto],
  })
  async getAllDepartments(
    @Query('withBudget') withBudget?: string,
    @Query('year') year?: string,
    @Query('type') type?: string,
  ): Promise<DepartmentDto[]> {
    const includeBudget = withBudget === 'true';
    return this.departmentsService.getAllDepartments(includeBudget, year, type);
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get specific department by code' })
  @ApiParam({ name: 'code', example: '07', description: 'Department code' })
  @ApiResponse({
    status: 200,
    description: 'Returns department details',
    type: DepartmentDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Department not found',
  })
  async getDepartmentByCode(
    @Param('code') code: string,
    @Query('withBudget') withBudget?: string,
    @Query('year') year?: string,
    @Query('type') type?: string,
  ): Promise<DepartmentDto> {
    const includeBudget = withBudget === 'true';
    const department = await this.departmentsService.getDepartmentByCode(
      code,
      includeBudget,
      year,
      type,
    );

    if (!department) {
      throw new NotFoundException(`Department with code '${code}' not found`);
    }

    return department;
  }

  @Get(':code/details')
  @ApiOperation({
    summary:
      'Get comprehensive department details with NEP/GAA comparison (OPTIMIZED)',
    description:
      'Returns all department relationships with NEP vs GAA budget comparison, percentage changes, and detailed breakdowns by region, funding source, and expense category. Removed type parameter - now fetches both NEP and GAA in a single optimized query.',
  })
  @ApiParam({ name: 'code', example: '07', description: 'Department code' })
  @ApiResponse({
    status: 200,
    description:
      'Returns comprehensive department details with NEP/GAA comparison, percentage changes, and all related entities',
    type: DepartmentDetailDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Department not found',
  })
  async getDepartmentDetails(
    @Param('code') code: string,
    @Query('year') year?: string,
  ): Promise<any> {
    const department = await this.departmentsService.getDepartmentDetails(
      code,
      year,
    );

    if (!department) {
      throw new NotFoundException(`Department with code '${code}' not found`);
    }

    return department;
  }
}
