import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CacheService } from '../redis/cache.service';
import { RegisterDto } from './dto/auth.dto';

@Injectable()
export class AuthService {
  private readonly ACCESS_TTL = '15m'; // Access token TTL
  private readonly REFRESH_TTL = '7d'; // Refresh token TTL
  private readonly REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60;

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly cacheService: CacheService,
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
    const newUser = this.usersService.create({ email, displayName, ...data });

    return await this.generateAndCacheTokens(newUser);
  }

  async login(user: any) {
    return this.generateAndCacheTokens(user);
  }

  async refreshToken(userId: string, token: string) {
    const cached = await this.cacheService.get<string>(`refresh:${userId}`);
    if (!cached || cached !== token) {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const user = await this.usersService.findOneById(userId);
    if (!user) throw new NotFoundException('User not found');

    const tokens = await this.generateAndCacheTokens(user);

    return { ...tokens };
  }

  async logout(userId: string) {
    await this.cacheService.del(`refresh:${userId}`);
    return { message: 'Logged out' };
  }

  // =======================
  // PRIVATE HELPERS
  // =======================
  private async generateAndCacheTokens(user: any) {
    const payload = { sub: user.id, role: user.role };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.ACCESS_TTL,
    });

    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.REFRESH_TTL,
    });

    await this.cacheService.set(
      `refresh:${user.id}`,
      refreshToken,
      this.REFRESH_TTL_SECONDS,
    );

    return { access_token: accessToken, refresh_token: refreshToken };
  }
}
