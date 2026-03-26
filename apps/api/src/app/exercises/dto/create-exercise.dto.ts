import { IsString, IsEnum, IsOptional, IsArray, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { ExerciseCategoryEnum, ExerciseTrackingTypeEnum } from '@ltrc-campo/shared-api-model';

export class ExerciseVideoDto {
  @IsString()
  url: string;

  @IsOptional()
  @IsString()
  title?: string;
}

export class CreateExerciseDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(ExerciseCategoryEnum)
  category: ExerciseCategoryEnum;

  @IsOptional()
  @IsEnum(ExerciseTrackingTypeEnum)
  trackingType?: ExerciseTrackingTypeEnum;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  muscleGroups?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  equipment?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ExerciseVideoDto)
  videos?: ExerciseVideoDto[];

  @IsOptional()
  @IsString()
  instructions?: string;
}
