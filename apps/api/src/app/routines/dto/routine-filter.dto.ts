import { IsEnum, IsOptional, IsString } from 'class-validator';
import { CategoryEnum, RoutineStatusEnum, SportEnum } from '@ltrc-campo/shared-api-model';

export class RoutineFilterDto {
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @IsEnum(SportEnum)
  sport?: SportEnum;

  @IsOptional()
  @IsEnum(CategoryEnum)
  category?: CategoryEnum;

  @IsOptional()
  @IsEnum(RoutineStatusEnum)
  status?: RoutineStatusEnum;
}
