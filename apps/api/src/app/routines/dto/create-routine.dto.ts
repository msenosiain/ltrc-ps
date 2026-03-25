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
import { CategoryEnum, RoutineStatusEnum, SportEnum } from '@ltrc-campo/shared-api-model';

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

export class RoutineExerciseEntryDto {
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

export class RoutineBlockDto {
  @IsString()
  title: string;

  @IsNumber()
  order: number;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutineExerciseEntryDto)
  exercises: RoutineExerciseEntryDto[];
}

export class CreateRoutineDto {
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
  @IsEnum(CategoryEnum, { each: true })
  assignedCategories?: CategoryEnum[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assignedBranches?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assignedDivisions?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => RoutineBlockDto)
  blocks?: RoutineBlockDto[];

  @IsOptional()
  @IsEnum(RoutineStatusEnum)
  status?: RoutineStatusEnum;

  @IsOptional()
  @IsString()
  notes?: string;
}
