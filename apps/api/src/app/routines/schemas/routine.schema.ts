import { Schema, Types } from 'mongoose';
import { RoutineEntity } from './routine.entity';
import { CategoryEnum, RoutineStatusEnum, SportEnum } from '@ltrc-campo/shared-api-model';
import { ExerciseEntity } from '../../exercises/schemas/exercise.entity';

const SetEntrySchema = new Schema(
  {
    reps: { type: String },
    duration: { type: String },
    load: { type: String },
  },
  { _id: false }
);

const RoutineExerciseEntrySchema = new Schema(
  {
    exercise: { type: Types.ObjectId, ref: ExerciseEntity.name, required: true },
    order: { type: Number, required: true },
    sets: [SetEntrySchema],
    rest: { type: String },
    notes: { type: String },
  },
  { _id: false }
);

const RoutineBlockSchema = new Schema(
  {
    title: { type: String, required: true },
    order: { type: Number, required: true },
    exercises: [RoutineExerciseEntrySchema],
  },
  { _id: false }
);

export const RoutineSchema = new Schema<RoutineEntity>(
  {
    name: { type: String, required: true },
    description: { type: String },
    sport: { type: String, enum: Object.values(SportEnum) },
    category: { type: String, enum: Object.values(CategoryEnum) },
    validFrom: { type: String, required: true },
    validUntil: { type: String, required: true },
    daysOfWeek: [{ type: String }],
    assignedPlayers: [{ type: Types.ObjectId, ref: 'Player' }],
    assignedBranches: [{ type: String }],
    blocks: [RoutineBlockSchema],
    status: {
      type: String,
      enum: Object.values(RoutineStatusEnum),
      default: RoutineStatusEnum.DRAFT,
    },
    notes: { type: String },
    createdBy: { type: Types.ObjectId, ref: 'User' },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'routines' }
);

RoutineSchema.virtual('id').get(function () {
  return (this._id as Types.ObjectId).toHexString();
});

RoutineSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
  },
});
