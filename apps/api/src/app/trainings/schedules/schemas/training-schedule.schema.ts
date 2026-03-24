import { Schema, Types } from 'mongoose';
import { TrainingScheduleEntity } from './training-schedule.entity';
import {
  CategoryEnum,
  DayOfWeekEnum,
  SportEnum,
} from '@ltrc-campo/shared-api-model';

const TimeSlotSchema = new Schema(
  {
    day: { type: String, enum: Object.values(DayOfWeekEnum), required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    location: { type: String },
  },
  { _id: false }
);

export const TrainingScheduleSchema = new Schema<TrainingScheduleEntity>(
  {
    sport: { type: String, enum: Object.values(SportEnum), required: true },
    category: {
      type: String,
      enum: Object.values(CategoryEnum),
      required: true,
    },
    division: { type: String },
    timeSlots: { type: [TimeSlotSchema], required: true },
    isActive: { type: Boolean, default: true },
    validFrom: { type: String },
    validUntil: { type: String },
    generatedUntil: { type: String },
    createdBy: { type: Types.ObjectId, ref: 'User' },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    collection: 'training_schedules',
  }
);

TrainingScheduleSchema.virtual('id').get(function () {
  return (this._id as Types.ObjectId).toHexString();
});

TrainingScheduleSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
  },
});
