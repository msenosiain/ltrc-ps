import { Schema, Types } from 'mongoose';
import { PlayerEvaluationEntity } from './player-evaluation.entity';
import { PlayerEntity } from '../../players/schemas/player.entity';

const SubcriterionSchema = new Schema(
  {
    name: { type: String, required: true },
    score: { type: Number, required: true, min: 0, max: 3 },
  },
  { _id: false }
);

const SkillResultSchema = new Schema(
  {
    skill: { type: String, required: true },
    subcriteria: [SubcriterionSchema],
    total: { type: Number, required: true },
    level: { type: String, required: true },
  },
  { _id: false }
);

export const PlayerEvaluationSchema = new Schema<PlayerEvaluationEntity>(
  {
    player: { type: Types.ObjectId, ref: PlayerEntity.name, required: true },
    category: { type: String, required: true },
    sport: { type: String, required: true },
    period: { type: String, required: true }, // "2025-04"
    evaluatedBy: { type: Types.ObjectId, ref: 'User', required: true },
    date: { type: Date, required: true },
    skills: [SkillResultSchema],
    overallTotal: { type: Number, required: true },
    overallLevel: { type: String, required: true },
    notes: { type: String },
  },
  {
    timestamps: true,
    collection: 'player_evaluations',
  }
);

PlayerEvaluationSchema.index({ player: 1, period: 1, sport: 1 }, { unique: true });
PlayerEvaluationSchema.index({ category: 1, sport: 1, period: 1 });

PlayerEvaluationSchema.virtual('id').get(function () {
  return (this._id as Types.ObjectId).toHexString();
});

PlayerEvaluationSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
  },
});
