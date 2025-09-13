import { Injectable } from '@nestjs/common'
import { UsersEntity } from './entities/users.entity'
import { BaseCrudService } from '../../core/common/services/base-crud.service'
import { DataSource, Repository } from 'typeorm'
import { CacheService } from '../../core/redis/cache.service'
import { InjectRepository } from '@nestjs/typeorm'

@Injectable()
export class UsersService extends BaseCrudService<UsersEntity> {
  constructor(
    @InjectRepository(UsersEntity)
    repo: Repository<UsersEntity>,
    dataSource: DataSource,
    cacheService: CacheService,
  ) {
    super(repo, dataSource.manager, cacheService)
  }

  async findByEmail(email: string): Promise<UsersEntity | null> {
    return this.repository.findOne({ where: { email } })
  }
}
