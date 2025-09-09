import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/user.service';

export interface JwtPayload {
  sub: string;
  email: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService,
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>('jwt.secret'),
      algorithms: ['HS256'], // Explicitly specify algorithm for security
    });
  }

  async validate(payload: JwtPayload) {
    // Validate payload structure
    if (!payload.sub || !payload.email) {
      throw new UnauthorizedException('Invalid token payload');
    }

    try {
      const user = await this.usersService.findUserById(payload.sub);
      if (!user || !user.user) {
        throw new UnauthorizedException('User not found');
      }

      // Additional security check: verify email matches
      if (user.user.email !== payload.email) {
        throw new UnauthorizedException('Token email mismatch');
      }

      return user.user;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Token validation failed');
    }
  }
}
