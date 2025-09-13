import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { DeepPartial, EntityManager, ObjectLiteral, Repository } from 'typeorm';
import { CacheService } from '../../redis/cache.service';

@Injectable()
export abstract class BaseCrudService<T extends ObjectLiteral> {
  protected readonly logger = new Logger(BaseCrudService.name);

  constructor(
    protected readonly repository: Repository<T>,
    protected readonly dataSource: EntityManager,
    protected readonly cacheService: CacheService,
  ) {}

  async create(payload: DeepPartial<T>, manager?: EntityManager): Promise<T> {
    const repo = manager
      ? manager.getRepository(this.repository.target)
      : this.repository;

    const entity = repo.create(payload);
    const saved = await repo.save(entity);
    await this.invalidateCache(saved['id']);
    return saved;
  }

  async update(
    id: string | number,
    payload: DeepPartial<T>,
    manager?: EntityManager,
  ): Promise<T> {
    const repo = manager
      ? manager.getRepository(this.repository.target)
      : this.repository;

    const entity = await repo.findOne({ where: { id } as any });
    if (!entity)
      throw new NotFoundException(
        `${this.repository.metadata.tableName} with id ${id} not found`,
      );

    repo.merge(entity, payload);
    const saved = await repo.save(entity);
    await this.invalidateCache(id);
    return saved;
  }

  async findOneById(id: string | number): Promise<T | null> {
    return this.repository.findOne({ where: { id } as any });
  }

  async findOneByIdCached(id: string | number, ttl = 60): Promise<T | null> {
    const key = `${this.repository.metadata.tableName}:id:${id}`;
    const cached = await this.cacheService.get<T>(key);
    if (cached) return cached;

    const entity = await this.findOneById(id);
    if (entity) await this.cacheService.set(key, entity, ttl);
    return entity;
  }

  protected async invalidateCache(id: string | number) {
    const pattern = `${this.repository.metadata.tableName}:*${id}*`;
    const keys = await this.cacheService.keys(pattern);
    if (keys.length)
      await Promise.all(keys.map((k) => this.cacheService.del(k)));

    this.logger.log(`Cache invalidated: ${keys.join(', ')}`);
  }
}
