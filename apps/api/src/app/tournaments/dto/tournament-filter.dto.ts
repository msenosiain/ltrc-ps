import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SportEnum } from '@ltrc-campo/shared-api-model';

export class TournamentFilterDto {
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @IsEnum(SportEnum)
  sport?: SportEnum;
}
