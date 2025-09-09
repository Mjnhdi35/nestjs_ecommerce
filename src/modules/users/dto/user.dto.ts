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

  @IsString()
  @IsNotEmpty()
  displayName: string;
}
export class UpdateUsersDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  displayName: string;
}

export class UserResponseDto {
  id: string;
  username: string;
  email: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
}
