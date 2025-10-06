import { ApiProperty } from '@nestjs/swagger';

export class BarangayDto {
  @ApiProperty({ example: '137404001' })
  psgcCode: string;

  @ApiProperty({ example: 'Barangay 1' })
  description: string;

  @ApiProperty({ example: 'Active' })
  status: string;
}

export class CityMunicipalityDto {
  @ApiProperty({ example: '137404' })
  psgcCode: string;

  @ApiProperty({ example: 'Manila' })
  description: string;

  @ApiProperty({ example: '1374' })
  provinceCode: string;

  @ApiProperty({ type: [BarangayDto] })
  barangays: BarangayDto[];
}

export class ProvinceDto {
  @ApiProperty({ example: '1374' })
  psgcCode: string;

  @ApiProperty({ example: 'Metro Manila' })
  description: string;

  @ApiProperty({ example: '13' })
  regionCode: string;

  @ApiProperty({ type: [CityMunicipalityDto] })
  citiesMunicipalities: CityMunicipalityDto[];
}

export class RegionHierarchyDto {
  @ApiProperty({ example: '13' })
  code: string;

  @ApiProperty({ example: 'National Capital Region (NCR)' })
  description: string;

  @ApiProperty({ type: [ProvinceDto] })
  provinces: ProvinceDto[];
}

export class LocationHierarchyResponseDto {
  @ApiProperty({ type: [RegionHierarchyDto] })
  data: RegionHierarchyDto[];

  @ApiProperty()
  meta: {
    totalRegions: number;
    totalProvinces: number;
    totalCitiesMunicipalities: number;
    totalBarangays: number;
  };
}
