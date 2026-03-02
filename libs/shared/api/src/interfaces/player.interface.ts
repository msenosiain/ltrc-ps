import { Document } from 'mongoose';
import { ClothingSizesEnum, PlayerPositionEnum } from '../enums';

export interface Address {
  street?: string;
  number?: string;
  floorApartment?: string;
  neighborhood?: string;
  city?: string;
  postalCode?: string;
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
  searchTerm?: string;
  position?: PlayerPositionEnum;
}

export interface Player extends Document {
  readonly id?: string;
  readonly idNumber: string;
  readonly lastName: string;
  readonly firstName: string;
  readonly nickName?: string;
  readonly birthDate: Date;
  readonly email: string;
  readonly address?: Address | undefined;
  readonly position: PlayerPositionEnum;
  readonly alternatePosition?: PlayerPositionEnum;
  readonly height?: number;
  readonly weight?: number;
  readonly clothingSizes?: ClothingSizes;
  readonly photoId?: string;
  readonly userId?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}
