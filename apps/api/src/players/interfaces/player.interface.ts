import { Document } from 'mongoose';
import { PlayerPositionEnum } from './player-position.enum';
import { ClothingSizesEnum } from './clothing-sizes.enum';

export interface Address {
  street?: string;
  number?: string;
  city?: string;
  province?: string;
  postalCode?: string;
  country?: string;
  phoneNumber: string;
}

export interface ClothingSizes {
  jersey?: ClothingSizesEnum;
  shorts?: ClothingSizesEnum;
  sweater?: ClothingSizesEnum;
  pants?: ClothingSizesEnum;
  [key: string]: ClothingSizesEnum;
}

export interface Player extends Document {
  readonly idNumber: string;
  readonly lastName: string;
  readonly firstName: string;
  readonly birthDate: Date;
  readonly email: string;
  readonly address?: Address;
  readonly position: PlayerPositionEnum;
  readonly alternatePosition?: PlayerPositionEnum;
  readonly size?: number;
  readonly weight?: number;
  readonly clothingSizes?: ClothingSizes;
}
