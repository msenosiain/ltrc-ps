import { Document } from 'mongoose';
import { Player } from './player.interface';

export interface SquadPlayerTemplate {
  shirtNumber: number;
  player: Player;
}

export interface Squad extends Document {
  readonly id?: string;
  readonly name: string;
  readonly players: SquadPlayerTemplate[];
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}
