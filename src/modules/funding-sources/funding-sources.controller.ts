import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { FundingSourcesService } from './funding-sources.service';
import { FundingSourceDto } from './dto/funding-source.dto';
import { FundingHierarchyResponseDto } from './dto/funding-hierarchy.dto';

@ApiTags('funding-sources')
@Controller('funding-sources')
export class FundingSourcesController {
  constructor(private readonly fundingSourcesService: FundingSourcesService) {}

  @Get('hierarchy')
  @ApiOperation({
    summary:
      'Get complete location hierarchy (Regions > Provinces > Cities > Barangays)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns hierarchical structure of all locations',
    type: FundingHierarchyResponseDto,
  })
  async getFundingSourceHierarchy(): Promise<FundingHierarchyResponseDto> {
    return this.fundingSourcesService.getFundingSourceHierarchy();
  }

  @Get()
  @ApiOperation({ summary: 'List all funding sources' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of all funding sources',
    type: [FundingSourceDto],
  })
  async getAllFundingSources(
    @Query('withBudget') withBudget?: string,
    @Query('year') year?: string,
    @Query('type') type?: string,
  ): Promise<FundingSourceDto[]> {
    const includeBudget = withBudget === 'true';
    return this.fundingSourcesService.getAllFundingSources(
      includeBudget,
      year,
      type,
    );
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get specific funding source by UACS code' })
  @ApiParam({
    name: 'code',
    example: '01010101',
    description: 'Funding source UACS code',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns funding source details',
    type: FundingSourceDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Funding source not found',
  })
  async getFundingSourceByCode(
    @Param('code') code: string,
    @Query('withBudget') withBudget?: string,
    @Query('year') year?: string,
    @Query('type') type?: string,
  ): Promise<FundingSourceDto> {
    const includeBudget = withBudget === 'true';
    const fundingSource =
      await this.fundingSourcesService.getFundingSourceByCode(
        code,
        includeBudget,
        year,
        type,
      );

    if (!fundingSource) {
      throw new NotFoundException(
        `Funding source with code '${code}' not found`,
      );
    }

    return fundingSource;
  }
}
