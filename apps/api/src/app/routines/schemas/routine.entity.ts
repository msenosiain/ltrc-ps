import { Document, Types } from 'mongoose';
import { CategoryEnum, RoutineStatusEnum, SportEnum } from '@ltrc-campo/shared-api-model';
import { ExerciseEntity } from '../../exercises/schemas/exercise.entity';

export class RoutineExerciseEntryEntity {
  exercise: Types.ObjectId | ExerciseEntity;
  order: number;
  sets?: number;
  reps?: string;
  duration?: string;
  rest?: string;
  load?: string;
  notes?: string;
}

export class RoutineBlockEntity {
  title: string;
  order: number;
  exercises: RoutineExerciseEntryEntity[];
}

export class RoutineEntity extends Document {
  id: string;
  name: string;
  description?: string;
  sport?: SportEnum;
  category?: CategoryEnum;
  validFrom: string;
  validUntil: string;
  daysOfWeek: string[];
  assignedPlayers: Types.ObjectId[];
  blocks: RoutineBlockEntity[];
  status: RoutineStatusEnum;
  notes?: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
