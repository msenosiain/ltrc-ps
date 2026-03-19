import { Document, PopulatedDoc, Types } from 'mongoose';
import { CategoryEnum } from '@ltrc-campo/shared-api-model';
import { PlayerEntity } from '../../players/schemas/player.entity';

export class SquadEntity extends Document {
  id: string;
  name: string;
  category?: CategoryEnum;
  players: {
    shirtNumber: number;
    player: PopulatedDoc<PlayerEntity & Document>;
  }[];
  createdBy?: Types.ObjectId;
  updatedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
