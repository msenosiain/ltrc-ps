import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import {
  CategoryEnum,
  MatchStatusEnum,
  SportEnum,
} from '@ltrc-campo/shared-api-model';

export class MatchFiltersDto {
  @IsOptional()
  @IsEnum(MatchStatusEnum)
  status?: MatchStatusEnum;

  @IsOptional()
  @IsString()
  tournament?: string; // MongoId or '__none__' (friendly matches)

  @IsOptional()
  @IsEnum(SportEnum)
  sport?: SportEnum;

  @IsOptional()
  @IsEnum(CategoryEnum)
  category?: CategoryEnum;

  @IsOptional()
  @IsString()
  fromDate?: string;

  @IsOptional()
  @IsString()
  toDate?: string;

  @IsOptional()
  @IsMongoId()
  playerId?: string;

  @IsOptional()
  @IsString()
  opponent?: string;

  @IsOptional()
  @IsString()
  division?: string;
}
