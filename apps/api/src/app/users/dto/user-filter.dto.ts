import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from '@ltrc-ps/shared-api-model';

export class UserFiltersDto {
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
