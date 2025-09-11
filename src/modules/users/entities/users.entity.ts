import * as bcrypt from 'bcrypt';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import { CoreEntity } from '../../../core/common/entities/core.entity';
import { Role } from '../../../core/types/role.enum';

@Entity('users')
export class UsersEntity extends CoreEntity {
  @Column({
    name: 'display_name',
    default: 'name_default',
    type: 'nvarchar',
    length: 100,
  })
  displayName: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'nvarchar', length: 50 })
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.GUEST })
  role: Role;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      const saltRounds = parseInt(process.env.SALT_ROUNDS!, 10);
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }
}
