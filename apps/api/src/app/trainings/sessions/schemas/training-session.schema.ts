import { Schema, Types } from 'mongoose';
import { TrainingSessionEntity } from './training-session.entity';
import {
  AttendanceStatusEnum,
  CategoryEnum,
  SportEnum,
  TrainingSessionStatusEnum,
} from '@ltrc-ps/shared-api-model';
import { TrainingScheduleEntity } from '../../schedules/schemas/training-schedule.entity';
import { PlayerEntity } from '../../../players/schemas/player.entity';

const AttendanceEntrySchema = new Schema(
  {
    player: { type: Types.ObjectId, ref: PlayerEntity.name },
    user: { type: String },
    userName: { type: String },
    isStaff: { type: Boolean, required: true },
    confirmed: { type: Boolean, default: false },
    confirmedAt: { type: Date },
    status: { type: String, enum: Object.values(AttendanceStatusEnum) },
    markedAt: { type: Date },
    markedBy: { type: String },
  },
  { _id: false }
);

export const TrainingSessionSchema = new Schema<TrainingSessionEntity>(
  {
    schedule: { type: Types.ObjectId, ref: TrainingScheduleEntity.name },
    date: { type: Date, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    sport: { type: String, enum: Object.values(SportEnum), required: true },
    category: {
      type: String,
      enum: Object.values(CategoryEnum),
      required: true,
    },
    division: { type: String },
    location: { type: String },
    status: {
      type: String,
      enum: Object.values(TrainingSessionStatusEnum),
      default: TrainingSessionStatusEnum.SCHEDULED,
    },
    attendance: [AttendanceEntrySchema],
    notes: { type: String },
  },
  {
    timestamps: true,
    collection: 'training_sessions',
  }
);

TrainingSessionSchema.virtual('id').get(function () {
  return (this._id as Types.ObjectId).toHexString();
});

TrainingSessionSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
  },
});
