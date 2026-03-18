import { Document, PopulatedDoc } from 'mongoose';
import {
  AttendanceStatusEnum,
  CategoryEnum,
  SportEnum,
  TrainingSessionStatusEnum,
} from '@ltrc-ps/shared-api-model';
import { TrainingScheduleEntity } from '../../schedules/schemas/training-schedule.entity';
import { PlayerEntity } from '../../../players/schemas/player.entity';

export class TrainingSessionEntity extends Document {
  id: string;
  schedule?: PopulatedDoc<TrainingScheduleEntity & Document>;
  date: Date;
  startTime: string;
  endTime: string;
  sport: SportEnum;
  category: CategoryEnum;
  division?: string;
  location?: string;
  status: TrainingSessionStatusEnum;
  attendance: {
    player?: PopulatedDoc<PlayerEntity & Document>;
    user?: string;
    userName?: string;
    isStaff: boolean;
    confirmed: boolean;
    confirmedAt?: Date;
    status?: AttendanceStatusEnum;
    markedAt?: Date;
    markedBy?: string;
  }[];
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
