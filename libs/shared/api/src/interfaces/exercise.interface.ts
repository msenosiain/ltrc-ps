import { ExerciseCategoryEnum } from '../enums';

export interface Exercise {
  id?: string;
  name: string;
  description?: string;
  category: ExerciseCategoryEnum;
  muscleGroups?: string[];
  equipment?: string[];
  videoUrl?: string;
  instructions?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
