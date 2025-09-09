import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ormConfig } from './core/config/orm.config';
import { jwtConfig } from './core/config/jwt.config';
import { DataSourceOptions } from 'typeorm';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DatabaseModule } from './core/database/database.module';
import { UsersModule } from './modules/users/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { APP_GUARD } from '@nestjs/core';
import { JwtAuthGuard } from './modules/auth/guards/jwt-auth.guard';
import { Reflector } from '@nestjs/core';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [ormConfig, jwtConfig],
    }),

    DatabaseModule,

    //Modules
    UsersModule,
    AuthModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    Reflector,
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
  ],
})
export class AppModule {}
