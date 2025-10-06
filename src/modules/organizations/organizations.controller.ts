import {
  Controller,
  Get,
  Param,
  Query,
  NotFoundException,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { OrganizationsService } from './organizations.service';
import { OrganizationDto } from './dto/organization.dto';
import { OrganizationHierarchyResponseDto } from './dto/organization-hierarchy.dto';

@ApiTags('organizations')
@Controller('organizations')
export class OrganizationsController {
  constructor(private readonly organizationsService: OrganizationsService) {}

  @Get('hierarchy')
  @ApiOperation({
    summary:
      'Get complete organization hierarchy (Departments > Agencies > Operating Units)',
  })
  @ApiResponse({
    status: 200,
    description:
      'Returns hierarchical structure of all departments, agencies, and operating units',
    type: OrganizationHierarchyResponseDto,
  })
  async getOrganizationHierarchy(): Promise<OrganizationHierarchyResponseDto> {
    return this.organizationsService.getOrganizationHierarchy();
  }

  @Get()
  @ApiOperation({ summary: 'Search organizations (operating units)' })
  @ApiResponse({
    status: 200,
    description: 'Returns list of organizations',
    type: [OrganizationDto],
  })
  async searchOrganizations(
    @Query('search') search?: string,
    @Query('department') department?: string,
    @Query('withBudget') withBudget?: string,
    @Query('year') year?: string,
    @Query('type') type?: string,
    @Query('limit') limit?: number,
  ): Promise<OrganizationDto[]> {
    const includeBudget = withBudget === 'true';
    return this.organizationsService.searchOrganizations(
      search,
      department,
      includeBudget,
      year,
      type,
      limit ? parseInt(limit.toString()) : 50,
    );
  }

  @Get(':code')
  @ApiOperation({ summary: 'Get specific organization by UACS code' })
  @ApiParam({
    name: 'code',
    example: '070500000000',
    description: 'Organization UACS code',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns organization details',
    type: OrganizationDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Organization not found',
  })
  async getOrganizationByCode(
    @Param('code') code: string,
    @Query('withBudget') withBudget?: string,
    @Query('year') year?: string,
    @Query('type') type?: string,
  ): Promise<OrganizationDto> {
    const includeBudget = withBudget === 'true';
    const organization = await this.organizationsService.getOrganizationByCode(
      code,
      includeBudget,
      year,
      type,
    );

    if (!organization) {
      throw new NotFoundException(`Organization with code '${code}' not found`);
    }

    return organization;
  }
}
