import { Inject, Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Redis } from 'ioredis';

@Injectable()
export class CacheService {
  private readonly defaultTtl: number;

  constructor(
    @Inject('REDIS_CLIENT') private readonly redis: Redis,
    private readonly configService: ConfigService,
  ) {
    this.defaultTtl =
      +this.configService.getOrThrow<number>('redis.defaultTtl');
  }

  // Expose Redis client for specialized services
  get redisClient(): Redis {
    return this.redis;
  }

  // =======================
  // GENERAL CACHE METHODS
  // =======================
  async set(key: string, value: any, ttlSeconds?: number) {
    const ttl = ttlSeconds ?? this.defaultTtl;
    await this.redis.set(key, JSON.stringify(value), 'EX', ttl);
  }

  async get<T>(key: string): Promise<T | null> {
    const val = await this.redis.get(key);
    return val ? (JSON.parse(val) as T) : null;
  }

  async del(key: string) {
    await this.redis.del(key);
  }

  async keys(pattern: string): Promise<string[]> {
    return this.redis.keys(pattern);
  }

  // =======================
  // ENTITY CACHE METHODS
  // =======================
  /**
   * Cache entity by ID
   */
  async setEntity<T>(
    entityName: string,
    id: string | number,
    entity: T,
    ttlSeconds?: number,
  ) {
    const key = `${entityName}:id:${id}`;
    await this.set(key, entity, ttlSeconds);
  }

  /**
   * Get cached entity by ID
   */
  async getEntity<T>(
    entityName: string,
    id: string | number,
  ): Promise<T | null> {
    const key = `${entityName}:id:${id}`;
    return this.get<T>(key);
  }

  /**
   * Invalidate all cache entries for an entity
   */
  async invalidateEntityCache(entityName: string, id: string | number) {
    const pattern = `${entityName}:*${id}*`;
    const keys = await this.redis.keys(pattern);
    if (keys.length > 0) {
      await this.redis.del(...keys);
    }
  }
}
