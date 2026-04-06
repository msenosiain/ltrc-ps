import { Document } from 'mongoose';
import { CategoryEnum } from '../enums/category.enum';
import { SportEnum } from '../enums/sport.enum';
import { EvaluationLevelEnum, EvaluationScore, EvaluationSkillEnum } from '../enums/evaluation-skill.enum';

export interface EvaluationSubcriterion {
  name: string;
  score: EvaluationScore;
}

export interface EvaluationSkillResult {
  skill: EvaluationSkillEnum;
  subcriteria: EvaluationSubcriterion[];
  total: number;
  level: EvaluationLevelEnum;
}

export interface PlayerEvaluation extends Document {
  readonly id?: string;
  readonly player: string;       // ref Player
  readonly category: CategoryEnum;
  readonly sport: SportEnum;
  readonly period: string;       // "2025-04"
  readonly evaluatedBy: string;  // ref User
  readonly date: Date;
  readonly skills: EvaluationSkillResult[];
  readonly overallTotal: number;
  readonly overallLevel: EvaluationLevelEnum;
  readonly notes?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export interface CategoryEvaluationSettings extends Document {
  readonly id?: string;
  readonly category: CategoryEnum;
  readonly sport: SportEnum;
  readonly evaluationsEnabled: boolean;
  readonly updatedBy?: string;
  readonly updatedAt?: Date;
}
