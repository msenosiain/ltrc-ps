import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';

export class UpdateWorkoutLogSetDto {
  @IsOptional() @IsString() plannedReps?: string;
  @IsOptional() @IsString() plannedDuration?: string;
  @IsOptional() @IsString() plannedLoad?: string;
  @IsOptional() @IsString() actualReps?: string;
  @IsOptional() @IsString() actualDuration?: string;
  @IsOptional() @IsString() actualLoad?: string;
  @IsOptional() @IsBoolean() completed?: boolean;
  @IsOptional() @IsString() notes?: string;
}

export class UpdateWorkoutLogExerciseDto {
  @IsString() exerciseId: string;
  @IsString() exerciseName: string;
  @IsNumber() order: number;
  @IsOptional() @IsString() notes?: string;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateWorkoutLogSetDto)
  sets: UpdateWorkoutLogSetDto[];
}

export class UpdateWorkoutLogBlockDto {
  @IsString() blockTitle: string;
  @IsNumber() blockOrder: number;
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateWorkoutLogExerciseDto)
  exercises: UpdateWorkoutLogExerciseDto[];
}

export class UpdateWorkoutLogDto {
  @IsOptional()
  @IsEnum(['in_progress', 'completed'])
  status?: 'in_progress' | 'completed';

  @IsOptional()
  @IsString()
  notes?: string;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpdateWorkoutLogBlockDto)
  blocks?: UpdateWorkoutLogBlockDto[];
}
