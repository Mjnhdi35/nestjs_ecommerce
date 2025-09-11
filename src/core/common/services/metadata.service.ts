import { Injectable, Logger } from '@nestjs/common';
import 'reflect-metadata';

@Injectable()
export class MetadataService {
  private readonly logger = new Logger(MetadataService.name);
  private entityMetadata = new Map<string, any>();

  setEntityMetadata(entity: Function, metadata: any) {
    this.entityMetadata.set(entity.name, metadata);
    this.logger.log(`Metadata registered for entity:${entity.name}`);
  }

  getEntityMetadata(entity: Function) {
    return this.entityMetadata.get(entity.name);
  }

  hasEntityMetadata(entity: Function): boolean {
    return this.entityMetadata.has(entity.name);
  }
}
