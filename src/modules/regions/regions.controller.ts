import { Controller, Get, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { RegionsService } from './regions.service';
import { RegionDto, RegionalAllocationDto } from './dto/region.dto';

@ApiTags('regions')
@Controller('regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Get()
  @ApiOperation({ summary: 'List all regions' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of all regions',
    type: [RegionDto],
  })
  async getAllRegions(
    @Query('withBudget') withBudget?: string,
    @Query('year') year?: string,
    @Query('type') type?: string,
  ): Promise<RegionDto[]> {
    const includeBudget = withBudget === 'true';
    return this.regionsService.getAllRegions(includeBudget, year, type);
  }

  @Get('allocation')
  @ApiOperation({
    summary: 'Get regional budget allocation with breakdown',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns regional allocation analysis',
    type: [RegionalAllocationDto],
  })
  async getRegionalAllocation(
    @Query('year') year: string,
    @Query('type') type: string,
    @Query('byDepartment') byDepartment?: string,
  ): Promise<RegionalAllocationDto[]> {
    const groupByDept = byDepartment === 'true';
    return this.regionsService.getRegionalAllocation(year, type, groupByDept);
  }
}
