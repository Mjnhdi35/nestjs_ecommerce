import { Module } from '@nestjs/common';
import { UsersEntity } from './entities/users.entity';
import { CacheService } from '../../core/redis/cache.service';
import { UsersService } from './users.service';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [TypeOrmModule.forFeature([UsersEntity])],
  providers: [UsersService, CacheService],
  exports: [UsersService, TypeOrmModule],
})
export class UsersModule {}
