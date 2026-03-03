import { IsEnum, IsOptional, IsString } from 'class-validator';
import { SortOrder, SportEnum } from '@ltrc-ps/shared-api-model';

export class TournamentFilterDto {
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @IsEnum(SportEnum)
  sport?: SportEnum;

  @IsOptional()
  @IsString()
  sortBy?: string;

  @IsOptional()
  @IsEnum(SortOrder)
  sortOrder?: SortOrder;
}
