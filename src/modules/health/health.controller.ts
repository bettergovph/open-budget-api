import { Controller, Get } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { Neo4jService } from '../../database/neo4j/neo4j.service';

@ApiTags('health')
@Controller('health')
export class HealthController {
  constructor(private readonly neo4jService: Neo4jService) {}

  @Get()
  @ApiOperation({ summary: 'Basic health check' })
  @ApiResponse({
    status: 200,
    description: 'API is healthy',
  })
  async healthCheck() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  @Get('detailed')
  @ApiOperation({ summary: 'Detailed health check' })
  @ApiResponse({
    status: 200,
    description: 'Detailed health status of all services',
  })
  async detailedHealthCheck() {
    const neo4jStatus = await this.checkNeo4j();

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        neo4j: neo4jStatus,
      },
    };
  }

  private async checkNeo4j() {
    try {
      const startTime = Date.now();
      await this.neo4jService.query('RETURN 1');
      const responseTime = Date.now() - startTime;

      return {
        status: 'ok',
        responseTime,
      };
    } catch (error) {
      return {
        status: 'error',
        message: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  }
}
