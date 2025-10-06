import { Inject, Injectable, OnModuleDestroy } from '@nestjs/common';
import { Driver, Session, int } from 'neo4j-driver';
import { NEO4J_DRIVER } from './neo4j.constants';

@Injectable()
export class Neo4jService implements OnModuleDestroy {
  constructor(@Inject(NEO4J_DRIVER) private readonly driver: Driver) {}

  async onModuleDestroy() {
    await this.driver.close();
  }

  getDriver(): Driver {
    return this.driver;
  }

  getSession(): Session {
    return this.driver.session();
  }

  async query<T = any>(
    cypher: string,
    params: Record<string, any> = {},
  ): Promise<T[]> {
    const session = this.getSession();
    try {
      const result = await session.run(cypher, params);
      return result.records.map((record) => record.toObject() as T);
    } finally {
      await session.close();
    }
  }

  async querySingle<T = any>(
    cypher: string,
    params: Record<string, any> = {},
  ): Promise<T | null> {
    const results = await this.query<T>(cypher, params);
    return results.length > 0 ? results[0] : null;
  }

  async queryWithPagination<T = any>(
    cypher: string,
    params: Record<string, any> = {},
    page: number = 1,
    limit: number = 50,
  ): Promise<{ data: T[]; total: number }> {
    const offset = (page - 1) * limit;

    // Get total count
    const countCypher = `${cypher} RETURN count(*) as total`;
    const countResult = await this.querySingle<{ total: number }>(
      countCypher,
      params,
    );
    const total = countResult?.total || 0;

    // Get paginated data
    const dataCypher = `${cypher} SKIP $offset LIMIT $limit`;
    const data = await this.query<T>(dataCypher, {
      ...params,
      offset: int(offset),
      limit: int(limit),
    });

    return { data, total };
  }
}
