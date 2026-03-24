import { RoutineStatusEnum } from '../enums';
import { Exercise } from './exercise.interface';

export interface RoutineExerciseEntry {
  exercise: Exercise | string;
  order: number;
  sets?: number;
  reps?: string;
  duration?: string;
  rest?: string;
  load?: string;
  notes?: string;
}

export interface RoutineBlock {
  title: string;
  order: number;
  exercises: RoutineExerciseEntry[];
}

export interface Routine {
  id?: string;
  name: string;
  description?: string;
  sport?: string;
  category?: string;
  validFrom: string;
  validUntil: string;
  daysOfWeek?: string[];
  assignedPlayers: (string | { id: string; name: string })[];
  blocks: RoutineBlock[];
  status: RoutineStatusEnum;
  notes?: string;
  createdBy?: string;
  createdAt?: Date;
  updatedAt?: Date;
}
