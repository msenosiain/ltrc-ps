import { IsEmail, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';
import { RolEnum } from '@ltrc-ps/shared-api-model';

export class CreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(6)
  password: string;

  @IsString()
  firstName: string;

  @IsString()
  lastName: string;

  @IsEnum(RolEnum)
  @IsOptional()
  rol?: RolEnum;

  @IsOptional()
  @IsString({ each: true })
  divisionIds?: string[];
}
