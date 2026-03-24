import { IsString, IsEnum, IsOptional, IsArray } from 'class-validator';
import { ExerciseCategoryEnum } from '@ltrc-campo/shared-api-model';

export class CreateExerciseDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ExerciseCategoryEnum)
  category: ExerciseCategoryEnum;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  muscleGroups?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipment?: string[];

  @IsOptional()
  @IsString()
  videoUrl?: string;

  @IsOptional()
  @IsString()
  instructions?: string;
}
