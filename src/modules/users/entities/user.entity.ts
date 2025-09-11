import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../../core/entities/base.core.entity';

@Entity('users')
export class UsersEntity extends BaseEntity {
  @Column()
  email: string;
  @Column()
  password: string;
  @Column({ name: 'display_name', nullable: true, default: 'Display_Name' })
  displayName?: string;
}
