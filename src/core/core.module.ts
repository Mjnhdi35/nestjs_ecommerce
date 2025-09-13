import { Global, Module } from '@nestjs/common';
import { AuthModule } from './auth/auth.module';
import { ConfigModule } from '@nestjs/config';
import { ormConfig } from './config/orm.config';
import { jwtConfig } from './config/jwt.config';
import { redisConfig } from './config/redis.config';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { CacheService } from './redis/cache.service';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [ormConfig, jwtConfig, redisConfig],
    }),

    DatabaseModule,
    RedisModule,
    AuthModule,
  ],
})
export class CoreModule {}
