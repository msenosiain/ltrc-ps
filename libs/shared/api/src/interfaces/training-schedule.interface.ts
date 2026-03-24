import { Document } from 'mongoose';
import { CategoryEnum, DayOfWeekEnum, SportEnum } from '../enums';

export interface TimeSlot {
  day: DayOfWeekEnum;
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  location?: string;
}

export interface TrainingSchedule extends Document {
  readonly id?: string;
  readonly sport: SportEnum;
  readonly category: CategoryEnum;
  readonly division?: string;
  readonly timeSlots: TimeSlot[];
  readonly isActive: boolean;
  readonly validFrom?: string;
  readonly validUntil?: string;
  readonly generatedUntil?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}

export interface TrainingScheduleFilters {
  sport?: SportEnum;
  category?: CategoryEnum;
  isActive?: boolean;
}
