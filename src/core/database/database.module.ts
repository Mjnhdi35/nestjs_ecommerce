import { Global, Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseService } from './database.service';
import { databaseOptions } from '../config/orm.config';

@Global()
@Module({
  imports: [TypeOrmModule.forRoot(databaseOptions)],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
