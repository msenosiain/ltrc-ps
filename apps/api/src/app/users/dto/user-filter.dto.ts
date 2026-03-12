import { IsEnum, IsOptional, IsString } from 'class-validator';
import { RoleEnum } from '@ltrc-ps/shared-api-model';

export class UserFiltersDto {
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @IsEnum(RoleEnum)
  role?: RoleEnum;
}
