import { Schema, Types } from 'mongoose';
import { TournamentEntity } from './tournament.entity';
import { SportEnum } from '@ltrc-ps/shared-api-model';

export const TournamentSchema = new Schema<TournamentEntity>(
  {
    name: { type: String, required: true },
    season: { type: String },
    description: { type: String },
    sport: { type: String, enum: Object.values(SportEnum) },
  },
  {
    timestamps: true,
    collection: 'tournaments',
  }
);

TournamentSchema.virtual('id').get(function () {
  return (this._id as Types.ObjectId).toHexString();
});

TournamentSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
  },
});
