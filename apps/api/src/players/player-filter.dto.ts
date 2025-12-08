import { IsOptional, IsString, IsEnum } from 'class-validator';
import { PlayerPositionEnum } from '@ltrc-ps/shared-api-model';

export class PlayerFiltersDto {
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @IsEnum(PlayerPositionEnum)
  position?: PlayerPositionEnum;
}
