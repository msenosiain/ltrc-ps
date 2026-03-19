import { Schema, Types } from 'mongoose';
import { AttendanceStatusEnum } from '@ltrc-ps/shared-api-model';
import { PlayerEntity } from '../../players/schemas/player.entity';

export const AttendanceEntrySchema = new Schema(
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
