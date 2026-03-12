import { Schema, Types } from 'mongoose';
import {
  CategoryEnum,
  HockeyBranchEnum,
  SportEnum,
} from '@ltrc-ps/shared-api-model';
import { BranchAssignmentEntity } from './branch-assignment.entity';
import { PlayerEntity } from '../../players/schemas/player.entity';

export const BranchAssignmentSchema = new Schema<BranchAssignmentEntity>(
  {
    player: {
      type: Schema.Types.ObjectId,
      ref: PlayerEntity.name,
      required: true,
    },
    branch: {
      type: String,
      enum: Object.values(HockeyBranchEnum),
      required: true,
    },
    category: {
      type: String,
      enum: Object.values(CategoryEnum),
      required: true,
    },
    season: { type: Number, required: true },
    sport: {
      type: String,
      enum: Object.values(SportEnum),
      default: SportEnum.HOCKEY,
    },
    assignedBy: { type: Schema.Types.ObjectId, ref: 'UserEntity' },
    assignedAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
    collection: 'branch-assignments',
  }
);

// Unique: one player per season
BranchAssignmentSchema.index({ player: 1, season: 1 }, { unique: true });

// Common queries
BranchAssignmentSchema.index({ season: 1, category: 1, branch: 1 });

BranchAssignmentSchema.virtual('id').get(function () {
  return (this._id as Types.ObjectId).toHexString();
});

BranchAssignmentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
  },
});
