import { Document, Types } from 'mongoose';
import { WorkoutEntity } from '../../routines/schemas/workout.entity';
import { PlayerEntity } from '../../players/schemas/player.entity';
import { ExerciseEntity } from '../../exercises/schemas/exercise.entity';

export type WorkoutLogStatus = 'in_progress' | 'completed';

export class WorkoutLogSetEntryEntity {
  plannedReps?: string;
  plannedDuration?: string;
  plannedLoad?: string;
  actualReps?: string;
  actualDuration?: string;
  actualLoad?: string;
  completed: boolean;
  notes?: string;
}

export class WorkoutLogExerciseEntryEntity {
  exerciseId: Types.ObjectId | ExerciseEntity;
  exerciseName: string;
  order: number;
  notes?: string;
  sets: WorkoutLogSetEntryEntity[];
}

export class WorkoutLogBlockEntity {
  blockTitle: string;
  blockOrder: number;
  exercises: WorkoutLogExerciseEntryEntity[];
}

export class WorkoutLogEntity extends Document {
  id: string;
  routine: Types.ObjectId | WorkoutEntity;
  player: Types.ObjectId | PlayerEntity;
  date: string;
  status: WorkoutLogStatus;
  notes?: string;
  blocks: WorkoutLogBlockEntity[];
  createdAt: Date;
  updatedAt: Date;
}
