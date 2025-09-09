import { IsEmail, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateUsersDto {
  @IsString()
  @IsNotEmpty()
  username: string;
  @IsString()
  @IsNotEmpty()
  @IsEmail()
  email: string;
  @IsString()
  @IsNotEmpty()
  @MinLength(6)
  password: string;
}
export class UpdateUsersDto {
  @IsString()
  @IsNotEmpty()
  username: string;
}
