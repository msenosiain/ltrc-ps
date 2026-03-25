import { Document, Types } from 'mongoose';
import { CategoryEnum, WorkoutStatusEnum, SportEnum } from '@ltrc-campo/shared-api-model';
import { ExerciseEntity } from '../../exercises/schemas/exercise.entity';

export class SetEntryEntity {
  reps?: string;
  duration?: string;
  load?: string;
}

export class WorkoutExerciseEntryEntity {
  exercise: Types.ObjectId | ExerciseEntity;
  order: number;
  sets: SetEntryEntity[];
  rest?: string;
  notes?: string;
}

export class WorkoutBlockEntity {
  title: string;
  order: number;
  exercises: WorkoutExerciseEntryEntity[];
}

export class WorkoutEntity extends Document {
  id: string;
  name: string;
  description?: string;
  sport?: SportEnum;
  category?: CategoryEnum;
  validFrom: string;
  validUntil: string;
  assignedPlayers: Types.ObjectId[];
  assignedBranches: string[];
  blocks: WorkoutBlockEntity[];
  status: WorkoutStatusEnum;
  notes?: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
