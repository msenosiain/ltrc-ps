import { IsEnum, IsMongoId, IsOptional, IsString } from 'class-validator';
import { CategoryEnum, MatchStatusEnum, MatchTypeEnum, SportEnum } from '@ltrc-ps/shared-api-model';

export class MatchFiltersDto {
  @IsOptional()
  @IsEnum(MatchStatusEnum)
  status?: MatchStatusEnum;

  @IsOptional()
  @IsEnum(MatchTypeEnum)
  type?: MatchTypeEnum;

  @IsOptional()
  @IsMongoId()
  tournament?: string;

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
}
