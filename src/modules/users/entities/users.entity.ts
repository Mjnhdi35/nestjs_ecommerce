import * as bcrypt from 'bcrypt';
import { BeforeInsert, BeforeUpdate, Column, Entity } from 'typeorm';
import { CoreEntity } from '../../../core/common/entities/core.entity';
import { Role } from '../../../core/types/role.enum';
import { Exclude, Expose } from 'class-transformer';

@Entity('users')
export class UsersEntity extends CoreEntity {
  @Column({
    default: 'name_default',
    type: 'nvarchar',
    length: 100,
    name: 'display_name',
  })
  @Expose({ name: 'display_name' })
  displayName: string;

  @Column({ unique: true })
  email: string;

  @Column({ type: 'nvarchar' })
  @Exclude()
  password: string;

  @Column({ type: 'enum', enum: Role, default: Role.GUEST })
  role: Role;

  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword() {
    if (this.password && !this.password.startsWith('$2b$')) {
      const saltRounds = Number(process.env.SALT_ROUNDS ?? 10);
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  async comparePassword(plain: string): Promise<boolean> {
    return bcrypt.compare(plain, this.password);
  }
}
