import { Document, Types } from 'mongoose';
import {
  CategoryEnum,
  DayOfWeekEnum,
  SportEnum,
} from '@ltrc-ps/shared-api-model';

export class TrainingScheduleEntity extends Document {
  id: string;
  sport: SportEnum;
  category: CategoryEnum;
  division?: string;
  timeSlots: {
    day: DayOfWeekEnum;
    startTime: string;
    endTime: string;
    location?: string;
  }[];
  isActive: boolean;
  validFrom?: Date;
  validUntil?: Date;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
