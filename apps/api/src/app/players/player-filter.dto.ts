import { IsOptional, IsString, IsEnum, IsIn } from 'class-validator';
import {
  CategoryEnum,
  HockeyPositions,
  PlayerPosition,
  RugbyPositions,
  SportEnum,
} from '@ltrc-ps/shared-api-model';

export class PlayerFiltersDto {
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @IsEnum(SportEnum)
  sport?: SportEnum;

  @IsOptional()
  @IsIn([
    ...new Set([
      ...Object.values(RugbyPositions),
      ...Object.values(HockeyPositions),
    ]),
  ])
  position?: PlayerPosition;

  @IsOptional()
  @IsEnum(CategoryEnum)
  category?: CategoryEnum;
}
