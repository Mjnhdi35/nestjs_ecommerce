import { Injectable } from '@nestjs/common';
import { CacheService } from './cache.service';
import { parseExpirationToSeconds } from '../common/utils/parse-expiration.util';

@Injectable()
export class AuthCacheService {
  constructor(private readonly cacheService: CacheService) {}

  /**
   * Set refresh token with proper TTL handling
   */
  async setRefreshToken(
    userId: string,
    refreshToken: string,
    ttlSeconds: number,
  ): Promise<void> {
    const key = `refresh:${userId}`;

    // Delete existing refresh token first to avoid duplicates
    await this.cacheService.del(key);

    // Set new refresh token with TTL
    await this.cacheService.redisClient.set(
      key,
      refreshToken,
      'EX',
      ttlSeconds,
    );
  }

  /**
   * Get refresh token for user
   */
  async getRefreshToken(userId: string): Promise<string | null> {
    const key = `refresh:${userId}`;
    return this.cacheService.redisClient.get(key);
  }

  /**
   * Delete refresh token for user
   */
  async deleteRefreshToken(userId: string): Promise<void> {
    const key = `refresh:${userId}`;
    await this.cacheService.del(key);
  }

  /**
   * Check if refresh token exists for user
   */
  async hasRefreshToken(userId: string): Promise<boolean> {
    const key = `refresh:${userId}`;
    const exists = await this.cacheService.redisClient.exists(key);
    return exists === 1;
  }

  /**
   * Delete all refresh tokens for a user (if multiple devices)
   */
  async deleteAllRefreshTokens(userId: string): Promise<void> {
    const pattern = `refresh:${userId}*`;
    const keys = await this.cacheService.redisClient.keys(pattern);
    if (keys.length > 0) {
      await this.cacheService.redisClient.del(...keys);
    }
  }

  /**
   * Get TTL of refresh token
   */
  async getRefreshTokenTTL(userId: string): Promise<number> {
    const key = `refresh:${userId}`;
    return this.cacheService.redisClient.ttl(key);
  }

  /**
   * Parse JWT expiration to seconds for Redis TTL
   */
  parseJwtExpirationToSeconds(expiration: string): number {
    return parseExpirationToSeconds(expiration);
  }
}
