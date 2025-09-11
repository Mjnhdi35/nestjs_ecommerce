import { Module } from '@nestjs/common';
import { UsersModule } from '../../modules/users/users.module';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { CacheService } from '../redis/cache.service';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AuthService } from './auth.service';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.register({ secret: process.env.JWT_SECRET }),
  ],
  providers: [AuthService, JwtStrategy, CacheService],
  exports: [AuthService],
})
export class AuthModule {}
