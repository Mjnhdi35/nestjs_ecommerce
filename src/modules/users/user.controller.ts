import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { UsersService } from './user.service';
import { CreateUsersDto } from './dto/user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  createUser(@Body() body: CreateUsersDto) {
    return this.usersService.createUsers(body);
  }

  @Get(':id')
  getUserById(@Param('id') id: string) {
    return this.usersService.findUserById(id);
  }
}
