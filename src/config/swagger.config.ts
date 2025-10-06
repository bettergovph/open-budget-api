import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = new DocumentBuilder()
  .setTitle('BetterGovPH Open Budget API')
  .setDescription(
    'Philippine Government Budget Data API (NEP/GAA 2020-2026) with comprehensive UACS dimension linking',
  )
  .setVersion('1.0')
  .addTag('budget', 'Budget records, aggregations, and NEP/GAA comparisons')
  .addTag('departments', 'Department information and budgets')
  .addTag('funding-sources', 'Funding source UACS codes and allocations')
  .addTag('organizations', 'Organization/Operating Unit UACS codes')
  .addTag('regions', 'Regional information and allocations')
  .addTag('expense-categories', 'Expense category classification')
  .addTag('health', 'Health check endpoints')
  .build();
