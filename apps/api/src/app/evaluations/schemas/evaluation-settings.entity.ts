import { Document, Types } from 'mongoose';
import { CategoryEnum, SportEnum } from '@ltrc-campo/shared-api-model';

export class EvaluationSettingsEntity extends Document {
  id: string;
  category: CategoryEnum;
  sport: SportEnum;
  evaluationsEnabled: boolean;
  updatedBy?: Types.ObjectId;
  updatedAt: Date;
}
