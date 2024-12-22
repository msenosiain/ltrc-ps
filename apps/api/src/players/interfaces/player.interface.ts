import { Document } from 'mongoose';
import { PlayerPositionEnum } from './player-position.enum';

export interface Player extends Document {
  readonly lastName: string;
  readonly firstName: string;
  readonly idNumber: string;
  readonly birthDate: Date;
  readonly email: string;
  readonly phoneNumber: string;
  readonly address?: string;
  readonly city?: string;
  readonly province?: string;
  readonly position: PlayerPositionEnum;
  readonly alternatePosition?: PlayerPositionEnum;
  readonly size?: number;
  readonly weight?: number;
}
