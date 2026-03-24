import { IsArray, IsEnum, IsOptional, IsString } from 'class-validator';
import { CategoryEnum, SportEnum } from '@ltrc-campo/shared-api-model';
import { Transform } from 'class-transformer';

export class TournamentFilterDto {
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @IsEnum(SportEnum)
  sport?: SportEnum;

  @IsOptional()
  @IsArray()
  @IsEnum(CategoryEnum, { each: true })
  @Transform(({ value }) => (Array.isArray(value) ? value : value ? [value] : undefined))
  categories?: CategoryEnum[];
}
