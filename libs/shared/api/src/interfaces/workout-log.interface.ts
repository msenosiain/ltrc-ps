export type WorkoutLogStatus = 'in_progress' | 'completed';

export interface WorkoutLogSetEntry {
  plannedReps?: string;
  plannedDuration?: string;
  plannedLoad?: string;
  actualReps?: string;
  actualDuration?: string;
  actualLoad?: string;
  completed: boolean;
  notes?: string;
}

export interface WorkoutLogExerciseEntry {
  exerciseId: string;
  exerciseName: string;
  order: number;
  notes?: string;
  sets: WorkoutLogSetEntry[];
}

export interface WorkoutLogBlock {
  blockTitle: string;
  blockOrder: number;
  exercises: WorkoutLogExerciseEntry[];
}

export interface WorkoutLog {
  id?: string;
  routine: string | { id: string; name: string };
  player: string | { id: string; name: string };
  date: string;
  status: WorkoutLogStatus;
  notes?: string;
  blocks: WorkoutLogBlock[];
  createdAt?: Date;
  updatedAt?: Date;
}
