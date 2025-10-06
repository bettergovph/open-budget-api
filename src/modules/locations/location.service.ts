import { Injectable } from '@nestjs/common';
import { Neo4jService } from '../../database/neo4j/neo4j.service';
import {
  LocationHierarchyResponseDto,
  RegionHierarchyDto,
} from './dto/location-hierarchy.dto';
import { RegionCypherDto } from './dto/location-cypher.dto';

@Injectable()
export class LocationsService {
  constructor(private readonly neo4jService: Neo4jService) {}

  async getLocationHierarchy(): Promise<LocationHierarchyResponseDto> {
    const CYPHER = `
      MATCH (r:Region)
      OPTIONAL MATCH (r)-[:HAS_PROVINCE]->(p:Province)
      OPTIONAL MATCH (p)-[:HAS_CITY]->(c:CityMunicipality)
      OPTIONAL MATCH (c)-[:HAS_BARANGAY]->(b:Barangay)
      RETURN r.code as regionCode,
            r.description as regionDescription,
            collect(DISTINCT {
              psgcCode: p.psgc_code,
              description: p.description,
              regionCode: p.region_code
            }) as provinces,
            collect(DISTINCT {
              psgcCode: c.psgc_code,
              description: c.description,
              provinceCode: c.province_code
            }) as cities,
            collect(DISTINCT {
              psgcCode: b.psgc_code,
              description: b.description,
              status: b.status,
              cityCode: substring(b.psgc_code, 0, 6)
            }) as barangays
      ORDER BY r.code
    `;

    const results: RegionCypherDto[] = await this.neo4jService.query(CYPHER);

    // console.log(results);
    let totalProvinces = 0;
    let totalCities = 0;
    let totalBarangays = 0;

    const regions: RegionHierarchyDto[] = results.map((region) => {
      const cityByProvince = new Map<
        string,
        Array<{
          psgcCode: string;
          description: string;
          provinceCode: string;
          barangays: Array<{
            psgcCode: string;
            description: string;
            status: string;
          }>;
        }>
      >();

      region.cities
        .filter((c) => c.psgcCode)
        .forEach((city) => {
          const provCode = city.provinceCode;

          if (!cityByProvince.has(provCode)) {
            cityByProvince.set(provCode, []);
          }

          const barangays = region.barangays
            .filter(
              (barangay) =>
                barangay.psgcCode && barangay.cityCode === city.psgcCode,
            )
            .map((barangay) => ({
              psgcCode: barangay.psgcCode,
              description: barangay.description,
              status: barangay.status || '',
            }));

          totalBarangays += barangays.length;

          cityByProvince.get(provCode)!.push({
            psgcCode: city.psgcCode,
            description: city.description,
            provinceCode: city.provinceCode,
            barangays,
          });
        });

      const provinces = region.provinces
        .filter((p) => p.psgcCode)
        .map((prov) => {
          // Extract the last 2 digits from the province PSGC code to match with city's provinceCode
          const shortProvinceCode = prov.psgcCode.slice(-2);
          const cities = cityByProvince.get(shortProvinceCode) || [];
          totalCities += cities.length;
          return {
            psgcCode: prov.psgcCode,
            description: prov.description,
            regionCode: prov.regionCode,
            citiesMunicipalities: cities,
          };
        });

      totalProvinces += provinces.length;

      return {
        code: region.regionCode,
        description: region.regionDescription,
        provinces,
      };
    });

    return {
      data: regions,
      meta: {
        totalRegions: regions.length,
        totalProvinces,
        totalCitiesMunicipalities: totalCities,
        totalBarangays,
      },
    };
  }
}
