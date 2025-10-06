import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import neo4j, { Driver } from 'neo4j-driver';
import { NEO4J_DRIVER } from './neo4j.constants';
import { Neo4jService } from './neo4j.service';

@Module({})
export class Neo4jModule {
  static forRootAsync(): DynamicModule {
    return {
      module: Neo4jModule,
      imports: [ConfigModule],
      providers: [
        {
          provide: NEO4J_DRIVER,
          inject: [ConfigService],
          useFactory: async (configService: ConfigService): Promise<Driver> => {
            const uri =
              configService.get<string>('neo4j.uri') ||
              'neo4j://localhost:7687';
            const user = configService.get<string>('neo4j.user') || 'neo4j';
            const password = configService.get<string>('neo4j.password') || '';

            const driver = neo4j.driver(uri, neo4j.auth.basic(user, password));

            // Verify connectivity
            await driver.verifyConnectivity();

            return driver;
          },
        },
        Neo4jService,
      ],
      exports: [Neo4jService],
      global: true,
    };
  }
}
