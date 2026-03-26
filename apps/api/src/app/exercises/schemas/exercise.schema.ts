import { Schema, Types } from 'mongoose';
import { ExerciseEntity } from './exercise.entity';
import { ExerciseCategoryEnum, ExerciseTrackingTypeEnum } from '@ltrc-campo/shared-api-model';

export const ExerciseSchema = new Schema<ExerciseEntity>(
  {
    name: { type: String, required: true },
    description: { type: String },
    category: { type: String, enum: Object.values(ExerciseCategoryEnum), required: true },
    trackingType: { type: String, enum: Object.values(ExerciseTrackingTypeEnum), default: ExerciseTrackingTypeEnum.WEIGHT_REPS },
    muscleGroups: [{ type: String }],
    equipment: [{ type: String }],
    videos: [{ url: { type: String, required: true }, title: { type: String } }],
    instructions: { type: String },
    createdBy: { type: Types.ObjectId, ref: 'User' },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
  },
  { timestamps: true, collection: 'exercises' }
);

ExerciseSchema.virtual('id').get(function () {
  return (this._id as Types.ObjectId).toHexString();
});

ExerciseSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
  },
});
