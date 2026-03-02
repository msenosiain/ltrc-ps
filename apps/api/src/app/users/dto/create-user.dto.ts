import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { Role } from '../../auth/roles.enum';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsNotEmpty()
  @IsString()
  lastName!: string;

  @IsNotEmpty()
  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  googleId?: string;

  @IsOptional()
  @IsString()
  password?: string;

  @IsOptional()
  @IsArray()
  @IsEnum(Role, { each: true })
  roles?: Role[];
}
