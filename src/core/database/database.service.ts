import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import { DataSource, EntityManager } from 'typeorm';

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  constructor(@InjectDataSource() private readonly dataSource: DataSource) {}

  async onModuleInit() {
    console.log('✅ Database module initialized');

    await this.dataSource.query('SELECT 1');
  }

  async onModuleDestroy() {
    console.log('🛑 Database module shutting down');
    await this.dataSource.destroy();
  }

  getDataSource(): DataSource {
    return this.dataSource;
  }

  getManager(): EntityManager {
    return this.dataSource.manager;
  }
}
