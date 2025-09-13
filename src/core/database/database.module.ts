import { Global, Module } from '@nestjs/common'
import { TypeOrmModule } from '@nestjs/typeorm'
import { DatabaseService } from './database.service'
import { databaseOptions } from '../config/orm.config'
import { UsersEntity } from '../../modules/users/entities/users.entity'

@Global()
@Module({
  imports: [
    TypeOrmModule.forRoot({
      ...databaseOptions,
      autoLoadEntities: true,
      entities: [UsersEntity],
    }),
  ],
  providers: [DatabaseService],
  exports: [DatabaseService],
})
export class DatabaseModule {}
