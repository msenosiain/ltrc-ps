import { Schema, Types } from 'mongoose';
import { EvaluationSettingsEntity } from './evaluation-settings.entity';

export const EvaluationSettingsSchema = new Schema<EvaluationSettingsEntity>(
  {
    category: { type: String, required: true },
    sport: { type: String, required: true },
    evaluationsEnabled: { type: Boolean, required: true, default: false },
    updatedBy: { type: Types.ObjectId, ref: 'User' },
  },
  {
    timestamps: true,
    collection: 'evaluation_settings',
  }
);

EvaluationSettingsSchema.index({ category: 1, sport: 1 }, { unique: true });

EvaluationSettingsSchema.virtual('id').get(function () {
  return (this._id as Types.ObjectId).toHexString();
});

EvaluationSettingsSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
  },
});
