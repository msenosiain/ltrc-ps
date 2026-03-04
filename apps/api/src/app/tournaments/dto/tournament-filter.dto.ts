import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SportEnum } from '@ltrc-ps/shared-api-model';

export class TournamentFilterDto {
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @IsEnum(SportEnum)
  sport?: SportEnum;
}
