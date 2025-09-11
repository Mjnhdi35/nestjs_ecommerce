import { Inject, Injectable } from '@nestjs/common';
import { Redis } from 'ioredis';

@Injectable()
export class CacheService {
  constructor(@Inject('REDIS_CLIENT') private readonly redis: Redis) {}

  async set(key: string, value: any, ttlSeconds = 60) {
    await this.redis.set(key, JSON.stringify(value), 'EX', ttlSeconds);
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
}
