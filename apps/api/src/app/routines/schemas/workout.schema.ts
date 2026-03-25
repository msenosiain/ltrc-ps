import { Schema, Types } from 'mongoose';
import { WorkoutEntity } from './workout.entity';
import { CategoryEnum, WorkoutStatusEnum, SportEnum } from '@ltrc-campo/shared-api-model';
import { ExerciseEntity } from '../../exercises/schemas/exercise.entity';

const SetEntrySchema = new Schema(
  {
    reps: { type: String },
    duration: { type: String },
    load: { type: String },
  },
  { _id: false }
);

const WorkoutExerciseEntrySchema = new Schema(
  {
    exercise: { type: Types.ObjectId, ref: ExerciseEntity.name, required: true },
    order: { type: Number, required: true },
    sets: [SetEntrySchema],
    rest: { type: String },
    notes: { type: String },
  },
  { _id: false }
);

const WorkoutBlockSchema = new Schema(
  {
    title: { type: String, required: true },
    order: { type: Number, required: true },
    exercises: [WorkoutExerciseEntrySchema],
  },
  { _id: false }
);

export const WorkoutSchema = new Schema<WorkoutEntity>(
  {
    name: { type: String, required: true },
    description: { type: String },
    sport: { type: String, enum: Object.values(SportEnum) },
    category: { type: String, enum: Object.values(CategoryEnum) },
    validFrom: { type: String, required: true },
    validUntil: { type: String, required: true },
    assignedPlayers: [{ type: Types.ObjectId, ref: 'Player' }],
    assignedBranches: [{ type: String }],
    blocks: [WorkoutBlockSchema],
    status: {
      type: String,
      enum: Object.values(WorkoutStatusEnum),
      default: WorkoutStatusEnum.DRAFT,
    },
    notes: { type: String },
    createdBy: { type: Types.ObjectId, ref: 'User' },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'workouts' }
);

WorkoutSchema.virtual('id').get(function () {
  return (this._id as Types.ObjectId).toHexString();
});

WorkoutSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
  },
});
