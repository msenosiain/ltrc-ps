import { Mongoose } from 'mongoose';
import { PlayerSchema } from './schemas/player.schema';
import { Player } from './interfaces/player.interface';
import { DATABASE_CONNECTION, PLAYER_MODEL } from '../shared/constants';

export const playersProviders = [
  {
    provide: PLAYER_MODEL,
    inject: [DATABASE_CONNECTION],
    useFactory: (mongoose: Mongoose) =>
      mongoose.model<Player>('Player', PlayerSchema),
  },
];
