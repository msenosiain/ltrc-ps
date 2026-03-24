import { Document, Types } from 'mongoose';
import {
  CategoryEnum,
  DayOfWeekEnum,
  SportEnum,
} from '@ltrc-campo/shared-api-model';

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
  validFrom?: string;
  validUntil?: string;
  generatedUntil?: string;
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
