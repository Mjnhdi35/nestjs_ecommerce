import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { ormConfig } from './core/config/orm.config';
import { jwtConfig } from './core/config/jwt.config';
import { DatabaseModule } from './core/database/database.module';
import { CacheService } from './core/redis/cache.service';
import { RedisModule } from './core/redis/redis.module';
import { CoreModule } from './core/core.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [ormConfig, jwtConfig],
    }),

    DatabaseModule,
    RedisModule,
    CoreModule,
  ],
  controllers: [AppController],
  providers: [AppService, CacheService],
  exports: [CacheService],
})
export class AppModule {}
