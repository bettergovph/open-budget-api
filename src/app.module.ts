import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import appConfig from './config/app.config';
import neo4jConfig from './config/neo4j.config';
import { Neo4jModule } from './database/neo4j/neo4j.module';
import { BudgetModule } from './modules/budget/budget.module';
import { DepartmentsModule } from './modules/departments/departments.module';
import { FundingSourcesModule } from './modules/funding-sources/funding-sources.module';
import { OrganizationsModule } from './modules/organizations/organizations.module';
import { RegionsModule } from './modules/regions/regions.module';
import { ExpenseCategoriesModule } from './modules/expense-categories/expense-categories.module';
import { HealthModule } from './modules/health/health.module';
import { LocationsModule } from './modules/locations/location.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [appConfig, neo4jConfig],
    }),
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 60 seconds
        limit: 100, // 100 requests per TTL
      },
    ]),
    Neo4jModule.forRootAsync(),
    BudgetModule,
    DepartmentsModule,
    FundingSourcesModule,
    OrganizationsModule,
    RegionsModule,
    ExpenseCategoriesModule,
    HealthModule,
    LocationsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
