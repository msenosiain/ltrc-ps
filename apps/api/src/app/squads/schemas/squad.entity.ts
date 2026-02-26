import { Document, PopulatedDoc } from 'mongoose';
import { PlayerEntity } from '../../players/schemas/player.entity';

export class SquadEntity extends Document {
  id: string;
  name: string;
  players: {
    shirtNumber: number;
    player: PopulatedDoc<PlayerEntity & Document>;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
