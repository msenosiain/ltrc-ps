import { IsEnum, IsOptional, IsString } from 'class-validator';
import { Role } from '../../auth/roles.enum';

export class UserFiltersDto {
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @IsEnum(Role)
  role?: Role;
}
