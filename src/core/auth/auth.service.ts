import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { AuthCacheService } from '../redis/auth-cache.service';
import { RegisterDto } from './dto/auth.dto';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly authCacheService: AuthCacheService,
    private readonly configService: ConfigService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new NotFoundException('Not found');

    const match = await bcrypt.compare(password, user.password);
    if (!match) throw new UnauthorizedException('Invalid credentials');

    return user;
  }

  async register(body: RegisterDto) {
    const { email, displayName, ...data } = body;
    const user = await this.usersService.findByEmail(email);
    if (user) {
      throw new ConflictException('Duplicated');
    }
    const newUser = await this.usersService.create({
      email,
      displayName,
      ...data,
    });
    const tokens = await this.generateAndCacheTokens(newUser);

    return { ...tokens };
  }

  async login(user: any) {
    return this.generateAndCacheTokens(user);
  }

  async refreshToken(userId: string, token: string) {
    // Check if refresh token exists
    const hasToken = await this.authCacheService.hasRefreshToken(userId);
    if (!hasToken) {
      throw new UnauthorizedException('Refresh token not found');
    }

    // Get and validate refresh token
    const cached = await this.authCacheService.getRefreshToken(userId);
    if (!cached || cached !== token) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    // Get user
    const user = await this.usersService.findOneById(userId);
    if (!user) throw new NotFoundException('User not found');

    // Generate new tokens (this will replace the old refresh token)
    const tokens = await this.generateAndCacheTokens(user);

    return { ...tokens };
  }

  async logout(userId: string) {
    await this.authCacheService.deleteRefreshToken(userId);
    return { message: 'Logged out' };
  }

  // =======================
  // PRIVATE HELPERS
  // =======================
  private async generateAndCacheTokens(user: any) {
    const payload = { sub: user.id, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.configService.get<string>('jwt.expiresIn'),
    });

    const refreshExpiresIn = this.configService.get<string>(
      'jwt.refreshExpiresIn',
    );
    const refreshToken = this.jwtService.sign(payload, {
      secret: this.configService.get<string>('jwt.refreshSecret'),
      expiresIn: refreshExpiresIn,
    });

    // Calculate TTL from JWT config using AuthCacheService
    const refreshTtlSeconds = this.authCacheService.parseJwtExpirationToSeconds(
      refreshExpiresIn as string,
    );

    // Use AuthCacheService for refresh tokens with proper TTL handling
    await this.authCacheService.setRefreshToken(
      user.id,
      refreshToken,
      refreshTtlSeconds,
    );

    return { access_token: accessToken, refresh_token: refreshToken };
  }
}
