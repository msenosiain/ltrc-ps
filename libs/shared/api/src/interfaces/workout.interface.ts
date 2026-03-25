import { WorkoutStatusEnum } from '../enums';
import { Exercise } from './exercise.interface';

export interface SetEntry {
  reps?: string;
  duration?: string;
  load?: string;
}

export interface WorkoutExerciseEntry {
  exercise: Exercise | string;
  order: number;
  sets: SetEntry[];
  rest?: string;
  notes?: string;
}

export interface WorkoutBlock {
  title: string;
  order: number;
  exercises: WorkoutExerciseEntry[];
}

export interface Workout {
  id?: string;
  name: string;
  description?: string;
  sport?: string;
  category?: string;
  validFrom: string;
  validUntil: string;
  daysOfWeek?: string[];
  assignedPlayers: (string | { id: string; name: string })[];
  assignedBranches?: string[];
  blocks: WorkoutBlock[];
  status: WorkoutStatusEnum;
  notes?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
