import {
  IsArray,
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
} from 'class-validator';
import { CategoryEnum, HockeyBranchEnum, Role, SportEnum } from '@ltrc-ps/shared-api-model';

export class CreateUserDto {
  @IsNotEmpty()
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  memberNumber?: string;

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

  @IsOptional()
  @IsArray()
  @IsEnum(SportEnum, { each: true })
  sports?: SportEnum[];

  @IsOptional()
  @IsArray()
  @IsEnum(CategoryEnum, { each: true })
  categories?: CategoryEnum[];

  @IsOptional()
  @IsArray()
  @IsEnum(HockeyBranchEnum, { each: true })
  branches?: HockeyBranchEnum[];
}
