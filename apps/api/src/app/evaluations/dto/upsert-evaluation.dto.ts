import { Type } from 'class-transformer';
import {
  IsArray,
  IsDateString,
  IsEnum,
  IsMongoId,
  IsOptional,
  IsString,
  ValidateNested,
} from 'class-validator';
import {
  CategoryEnum,
  EvaluationSkillEnum,
  SportEnum,
} from '@ltrc-campo/shared-api-model';

export class SubcriterionDto {
  @IsString()
  name: string;

  @IsEnum([0, 1, 2, 3])
  score: 0 | 1 | 2 | 3;
}

export class SkillInputDto {
  @IsEnum(EvaluationSkillEnum)
  skill: EvaluationSkillEnum;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SubcriterionDto)
  subcriteria: SubcriterionDto[];
}

export class UpsertEvaluationDto {
  @IsMongoId()
  playerId: string;

  @IsEnum(CategoryEnum)
  category: CategoryEnum;

  @IsEnum(SportEnum)
  sport: SportEnum;

  @IsString()
  period: string; // "2025-04"

  @IsDateString()
  date: string;

  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => SkillInputDto)
  skills: SkillInputDto[];

  @IsOptional()
  @IsString()
  notes?: string;
}
