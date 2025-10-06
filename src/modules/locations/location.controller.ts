import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { LocationsService } from './location.service';
import { LocationHierarchyResponseDto } from './dto/location-hierarchy.dto';

@ApiTags('locations')
@Controller('locations')
export class LocationsController {
  constructor(private readonly locationsService: LocationsService) {}

  @Get('hierarchy')
  @ApiOperation({
    summary:
      'Get complete location hierarchy (Regions > Provinces > Cities > Barangays)',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns hierarchical structure of all locations',
    type: LocationHierarchyResponseDto,
  })
  async getLocationHierarchy(): Promise<LocationHierarchyResponseDto> {
    return this.locationsService.getLocationHierarchy();
  }
}
