import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SportEnum, TripStatusEnum } from '@ltrc-campo/shared-api-model';

export class TripFilterDto {
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @IsEnum(SportEnum)
  sport?: SportEnum;

  @IsOptional()
  @IsEnum(TripStatusEnum)
  status?: TripStatusEnum;
}
