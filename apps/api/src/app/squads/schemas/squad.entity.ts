import { Document, PopulatedDoc } from 'mongoose';
import { CategoryEnum } from '@ltrc-ps/shared-api-model';
import { PlayerEntity } from '../../players/schemas/player.entity';

export class SquadEntity extends Document {
  id: string;
  name: string;
  category?: CategoryEnum;
  players: {
    shirtNumber: number;
    player: PopulatedDoc<PlayerEntity & Document>;
  }[];
  createdAt: Date;
  updatedAt: Date;
}
