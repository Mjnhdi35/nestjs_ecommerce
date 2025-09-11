import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../../modules/users/users.service';
import { JwtService } from '@nestjs/jwt';
import { CacheService } from '../redis/cache.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly cacheService: CacheService,
  ) {}

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) return null;
    const match = await bcrypt.compare(password, user.password);
    if (!match) return null;
    return user;
  }

  async login(user: any) {
    const accessToken = this.jwtService.sign(
      { sub: user.id, role: user.role },
      { expiresIn: '1m' }, // Access token 1 phút
    );
    const refreshToken = this.jwtService.sign(
      { sub: user.id, role: user.role },
      { expiresIn: '7d' }, // Refresh token 7 ngày
    );

    // Lưu refresh token vào Redis với TTL 7 ngày
    await this.cacheService.set(
      `refresh:${user.id}`,
      refreshToken,
      7 * 24 * 60 * 60,
    );

    return { access_token: accessToken, refresh_token: refreshToken };
  }

  async refreshToken(userId: string, token: string) {
    const cached = await this.cacheService.get<string>(`refresh:${userId}`);
    if (!cached || cached !== token) throw new Error('Invalid refresh token');

    const user = await this.usersService.findOneById(userId);
    if (!user) throw new Error('User not found');

    const accessToken = this.jwtService.sign(
      { sub: user.id, role: user.role },
      { expiresIn: '1m' },
    );
    return { access_token: accessToken };
  }

  async logout(userId: string) {
    await this.cacheService.del(`refresh:${userId}`);
    return { message: 'Logged out' };
  }
}
