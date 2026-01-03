import { Document } from 'mongoose';
import { ClothingSizesEnum, PlayerPositionEnum } from '../enums';

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
  [key: string]: ClothingSizesEnum | undefined;
}

export interface PlayerFilters {
  firstName?: string;
  lastName?: string;
  nickName?: string;
  position?: PlayerPositionEnum;
  alternatePosition?: PlayerPositionEnum;
  idNumber?: string;
}

export interface Player extends Document {
  readonly idNumber: string;
  readonly lastName: string;
  readonly firstName: string;
  readonly nickName?: string;
  readonly birthDate: Date;
  readonly email: string;
  readonly address?: Address;
  readonly position: PlayerPositionEnum;
  readonly alternatePosition?: PlayerPositionEnum;
  readonly height?: number;
  readonly weight?: number;
  readonly clothingSizes?: ClothingSizes;
  readonly photoId?: string;
  readonly createdAt?: Date;  // agregados por timestamps: true
  readonly updatedAt?: Date;
}
