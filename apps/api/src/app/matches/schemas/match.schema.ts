import { Schema, Types } from 'mongoose';
import { MatchEntity } from './match.entity';
import { CategoryEnum, MatchStatusEnum, MatchTypeEnum, SportEnum } from '@ltrc-ps/shared-api-model';
import { PlayerEntity } from '../../players/schemas/player.entity';
import { TournamentEntity } from '../../tournaments/schemas/tournament.entity';

const MatchResultSchema = new Schema(
  {
    homeScore: { type: Number, required: true },
    awayScore: { type: Number, required: true },
  },
  { _id: false }
);

const MatchSquadEntrySchema = new Schema(
  {
    shirtNumber: { type: Number, required: true, min: 1, max: 26 },
    player: { type: Types.ObjectId, ref: PlayerEntity.name, required: true },
  },
  { _id: false }
);

const MatchVideoSchema = new Schema(
  {
    url: { type: String, required: true },
    name: { type: String, required: true },
    description: { type: String },
    targetPlayers: [{ type: Types.ObjectId, ref: PlayerEntity.name }],
  },
  { _id: false }
);

export const MatchSchema = new Schema<MatchEntity>(
  {
    date: { type: Date, required: true },
    time: { type: String },
    opponent: { type: String, required: true },
    venue: { type: String, required: true },
    isHome: { type: Boolean, required: true },
    status: {
      type: String,
      enum: Object.values(MatchStatusEnum),
      default: MatchStatusEnum.UPCOMING,
    },
    type: {
      type: String,
      enum: Object.values(MatchTypeEnum),
      required: true,
    },
    sport: {
      type: String,
      enum: Object.values(SportEnum),
    },
    category: {
      type: String,
      enum: Object.values(CategoryEnum),
    },
    division: { type: String },
    tournament: { type: Types.ObjectId, ref: TournamentEntity.name },
    squad: [MatchSquadEntrySchema],
    videos: [MatchVideoSchema],
    result: MatchResultSchema,
    notes: { type: String },
  },
  {
    timestamps: true,
    collection: 'matches',
  }
);

MatchSchema.virtual('id').get(function () {
  return (this._id as Types.ObjectId).toHexString();
});

MatchSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
  },
});
