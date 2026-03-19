import { Document } from 'mongoose';
import {
  CategoryEnum,
  SportEnum,
  TrainingSessionStatusEnum,
} from '../enums';
import { AttendanceEntry } from './attendance-entry.interface';
import { TrainingSchedule } from './training-schedule.interface';

export { AttendanceEntry };

export interface TrainingSession extends Document {
  readonly id?: string;
  readonly schedule?: TrainingSchedule;
  readonly date: Date;
  readonly startTime: string; // HH:mm
  readonly endTime: string; // HH:mm
  readonly sport: SportEnum;
  readonly category: CategoryEnum;
  readonly division?: string;
  readonly location?: string;
  readonly status: TrainingSessionStatusEnum;
  readonly attendance: AttendanceEntry[];
  readonly notes?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export interface TrainingSessionFilters {
  sport?: SportEnum;
  category?: CategoryEnum;
  status?: TrainingSessionStatusEnum;
  fromDate?: string;
  toDate?: string;
}

export interface UpcomingTraining {
  scheduleId: string;
  sessionId?: string;
  date: string; // ISO date
  startTime: string;
  endTime: string;
  sport: SportEnum;
  category: CategoryEnum;
  division?: string;
  location?: string;
  confirmations: number;
  confirmed?: boolean; // whether current user confirmed
}
