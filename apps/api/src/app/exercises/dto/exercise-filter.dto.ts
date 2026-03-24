import { IsEnum, IsOptional, IsString } from 'class-validator';
import { ExerciseCategoryEnum } from '@ltrc-campo/shared-api-model';

export class ExerciseFilterDto {
  @IsOptional()
  @IsString()
  searchTerm?: string;

  @IsOptional()
  @IsEnum(ExerciseCategoryEnum)
  category?: ExerciseCategoryEnum;
}
