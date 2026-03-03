import { Schema, Types } from 'mongoose';
import { SquadEntity } from './squad.entity';
import { PlayerEntity } from '../../players/schemas/player.entity';

const SquadPlayerSchema = new Schema(
  {
    shirtNumber: { type: Number, required: true, min: 1, max: 26 },
    player: { type: Types.ObjectId, ref: PlayerEntity.name, required: true },
  },
  { _id: false }
);

export const SquadSchema = new Schema<SquadEntity>(
  {
    name: { type: String, required: true },
    category: { type: String },
    players: [SquadPlayerSchema],
  },
  {
    timestamps: true,
    collection: 'squads',
  }
);

SquadSchema.virtual('id').get(function () {
  return (this._id as Types.ObjectId).toHexString();
});

SquadSchema.set('toJSON', {
  virtuals: true,
  versionKey: false,
  transform: (_, ret) => {
    delete ret._id;
  },
});
