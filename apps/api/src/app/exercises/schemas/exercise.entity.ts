import { Document, Types } from 'mongoose';
import { ExerciseCategoryEnum } from '@ltrc-campo/shared-api-model';

export class ExerciseEntity extends Document {
  id: string;
  name: string;
  description?: string;
  category: ExerciseCategoryEnum;
  muscleGroups: string[];
  equipment: string[];
  videos: { url: string; title?: string }[];
  instructions?: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
