import {
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { UsersEntity } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUsersDto } from './dto/user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(UsersEntity)
    private readonly usersRepository: Repository<UsersEntity>,
  ) {}

  async createUsers(body: CreateUsersDto) {
    const { email, ...data } = body;

    const emailExisting = await this.findUserByEmail(email);
    if (emailExisting) {
      throw new ConflictException('Duplicated');
    }
    const newUser = this.usersRepository.create({
      email,
      ...data,
    });
    const savedUser = await this.usersRepository.save(newUser);
    return { message: 'Successfull', user: savedUser };
  }

  async findUserById(id: string) {
    const user = await this.usersRepository.findOneBy({ id });
    if (!user) {
      throw new NotFoundException('Not Found');
    }
    return { message: 'Successfull', user };
  }

  async findUserByEmail(email: string) {
    return await this.usersRepository.findOneBy({ email });
  }
}
