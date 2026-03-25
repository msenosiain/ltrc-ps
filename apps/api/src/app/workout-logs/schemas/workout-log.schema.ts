import { Schema, Types } from 'mongoose';
import { WorkoutLogEntity } from './workout-log.entity';
import { ExerciseEntity } from '../../exercises/schemas/exercise.entity';

const WorkoutLogSetEntrySchema = new Schema(
  {
    plannedReps: { type: String },
    plannedDuration: { type: String },
    plannedLoad: { type: String },
    actualReps: { type: String },
    actualDuration: { type: String },
    actualLoad: { type: String },
    completed: { type: Boolean, default: false },
    notes: { type: String },
  },
  { _id: false }
);

const WorkoutLogExerciseEntrySchema = new Schema(
  {
    exerciseId: { type: Types.ObjectId, ref: ExerciseEntity.name },
    exerciseName: { type: String, required: true },
    order: { type: Number, required: true },
    notes: { type: String },
    sets: [WorkoutLogSetEntrySchema],
  },
  { _id: false }
);

const WorkoutLogBlockSchema = new Schema(
  {
    blockTitle: { type: String, required: true },
    blockOrder: { type: Number, required: true },
    exercises: [WorkoutLogExerciseEntrySchema],
  },
  { _id: false }
);

export const WorkoutLogSchema = new Schema<WorkoutLogEntity>(
  {
    routine: { type: Types.ObjectId, ref: 'Routine', required: true },
    player: { type: Types.ObjectId, ref: 'Player', required: true },
    date: { type: String, required: true },
    status: { type: String, enum: ['in_progress', 'completed'], default: 'in_progress' },
    notes: { type: String },
    blocks: [WorkoutLogBlockSchema],
  },
  { timestamps: true, collection: 'workout_logs' }
);

WorkoutLogSchema.virtual('id').get(function () {
  return (this._id as Types.ObjectId).toHexString();
});

WorkoutLogSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
  },
});
