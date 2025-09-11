import {
  IsEmail,
  IsNotEmpty,
  IsOptional,
  IsString,
  MinLength,
} from 'class-validator';

export class CreateUsersDto {
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
  @IsOptional()
  displayName?: string;

  @IsString()
  @IsEmail()
  @IsOptional()
  email?: string;

  @IsString()
  @MinLength(6)
  @IsOptional()
  password?: string;
}

export class UserResponseDto {
  id: string;
  email: string;
  displayName: string;
  createdAt: Date;
  updatedAt: Date;
}
