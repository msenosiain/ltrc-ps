import * as mongoose from 'mongoose';
import { PlayerPositionEnum } from '../interfaces/player-position.enum';
import { Player } from '../interfaces/player.interface';

export const PlayerSchema = new mongoose.Schema<Player>({
  lastName: String,
  firstName: String,
  idNumber: String,
  birthDate: Date,
  email: String,
  phoneNumber: String,
  address: String,
  city: String,
  province: String,
  position: {
    type: String,
    enum: PlayerPositionEnum,
  },
  alternatePosition: {
    type: String,
    enum: PlayerPositionEnum,
  },
  size: Number,
  weight: Number,
});
