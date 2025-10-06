// src/locations/dto/region-locations.dto.ts
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsArray, IsOptional, IsString, ValidateNested } from 'class-validator';

export class ProvinceDTO {
  @ApiProperty({ example: '063000000' })
  @IsString()
  psgcCode!: string;

  @ApiProperty({ example: 'Negros Occidental' })
  @IsString()
  description!: string;

  @ApiProperty({
    example: '06',
    description: 'Region code owning the province',
  })
  @IsString()
  regionCode!: string;
}

export class CityMunicipalityDTO {
  @ApiProperty({ example: '063019000' })
  @IsString()
  psgcCode!: string;

  @ApiProperty({ example: 'Silay City' })
  @IsString()
  description!: string;

  @ApiProperty({ example: '063000000', description: 'PSGC of parent province' })
  @IsString()
  provinceCode!: string;
}

export class BarangayDTO {
  @ApiProperty({ example: '063019001' })
  @IsString()
  psgcCode!: string;

  @ApiProperty({ example: 'Barangay 1' })
  @IsString()
  description!: string;

  @ApiProperty({ example: 'Active', required: false })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiProperty({
    example: '063019',
    description: 'Derived: substring(psgc_code, 0, 6) from Cypher',
  })
  @IsString()
  cityCode!: string;
}

export class RegionCypherDto {
  @ApiProperty({ example: '06' })
  @IsString()
  regionCode!: string;

  @ApiProperty({ example: 'Western Visayas' })
  @IsString()
  regionDescription!: string;

  @ApiProperty({ type: [ProvinceDTO] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ProvinceDTO)
  provinces!: ProvinceDTO[];

  @ApiProperty({ type: [CityMunicipalityDTO] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CityMunicipalityDTO)
  cities!: CityMunicipalityDTO[];

  @ApiProperty({ type: [BarangayDTO] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BarangayDTO)
  barangays!: BarangayDTO[];
}
