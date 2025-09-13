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

  async findOneByIdCached(
    id: string | number,
    ttl?: number,
  ): Promise<T | null> {
    const entityName = this.repository.metadata.tableName;
    const cached = await this.cacheService.getEntity<T>(entityName, id);
    if (cached) return cached;

    const entity = await this.findOneById(id);
    if (entity) {
      await this.cacheService.setEntity(entityName, id, entity, ttl);
    }
    return entity;
  }

  protected async invalidateCache(id: string | number) {
    const entityName = this.repository.metadata.tableName;
    await this.cacheService.invalidateEntityCache(entityName, id);
    this.logger.log(`Cache invalidated for ${entityName}:${id}`);
  }
}
