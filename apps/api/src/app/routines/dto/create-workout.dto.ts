import { Type } from 'class-transformer';
import {
  IsArray,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';
import { CategoryEnum, WorkoutStatusEnum, SportEnum } from '@ltrc-campo/shared-api-model';

export class SetEntryDto {
  @IsOptional()
  @IsString()
  reps?: string;

  @IsOptional()
  @IsString()
  duration?: string;

  @IsOptional()
  @IsString()
  load?: string;
}

export class WorkoutExerciseEntryDto {
  @IsString()
  exercise: string;

  @IsNumber()
  order: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SetEntryDto)
  sets: SetEntryDto[];

  @IsOptional()
  @IsString()
  rest?: string;

  @IsOptional()
  @IsString()
  notes?: string;
}

export class WorkoutBlockDto {
  @IsString()
  title: string;

  @IsNumber()
  order: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutExerciseEntryDto)
  exercises: WorkoutExerciseEntryDto[];
}

export class CreateWorkoutDto {
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(SportEnum)
  sport?: SportEnum;

  @IsOptional()
  @IsEnum(CategoryEnum)
  category?: CategoryEnum;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  validFrom: string;

  @IsString()
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  validUntil: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  daysOfWeek?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assignedPlayers?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assignedBranches?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => WorkoutBlockDto)
  blocks?: WorkoutBlockDto[];

  @IsOptional()
  @IsEnum(WorkoutStatusEnum)
  status?: WorkoutStatusEnum;

  @IsOptional()
  @IsString()
  notes?: string;
}
