import { Document, Types } from 'mongoose';
import {
  CategoryEnum,
  EvaluationLevelEnum,
  EvaluationScore,
  EvaluationSkillEnum,
  SportEnum,
} from '@ltrc-campo/shared-api-model';
import { PlayerEntity } from '../../players/schemas/player.entity';

export class PlayerEvaluationEntity extends Document {
  id: string;
  player: Types.ObjectId | PlayerEntity;
  category: CategoryEnum;
  sport: SportEnum;
  period: string; // "2025-04"
  evaluatedBy: Types.ObjectId;
  date: Date;
  skills: {
    skill: EvaluationSkillEnum;
    subcriteria: { name: string; score: EvaluationScore }[];
    total: number;
    level: EvaluationLevelEnum;
  }[];
  overallTotal: number;
  overallLevel: EvaluationLevelEnum;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
