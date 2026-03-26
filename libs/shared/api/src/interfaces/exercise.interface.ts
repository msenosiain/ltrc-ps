import { ExerciseCategoryEnum } from '../enums';

export interface ExerciseVideo {
  url: string;
  title?: string;
}

export interface Exercise {
  id?: string;
  name: string;
  description?: string;
  category: ExerciseCategoryEnum;
  muscleGroups?: string[];
  equipment?: string[];
  videos?: ExerciseVideo[];
  instructions?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
