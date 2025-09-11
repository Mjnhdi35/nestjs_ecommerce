import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async onModuleInit() {
    console.log('✅ DatabaseService initialized');
    try {
      await this.dataSource.query('SELECT 1');
    } catch (err) {
      console.error('❌ Database connection failed:', err);
      throw err;
    }
  }

  async onModuleDestroy() {
    console.log('🛑 DatabaseService shutting down');
    if (this.dataSource.isInitialized) {
      await this.dataSource.destroy();
    }
  }

  getDataSource(): DataSource {
    return this.dataSource;
  }

  getManager(): EntityManager {
    return this.dataSource.manager;
  }

  async transaction<T>(
    runInTransaction: (manager: EntityManager) => Promise<T>,
  ): Promise<T> {
    return this.dataSource.transaction(runInTransaction);
  }
}
