import { Document } from 'mongoose';
import {
  CategoryEnum,
  ClothingSizesEnum,
  HockeyBranchEnum,
  HockeyPositions,
  RugbyPositions,
  SportEnum,
} from '../enums';

export type PlayerPosition = RugbyPositions | HockeyPositions;

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

export interface MedicalData {
  height?: number;
  weight?: number;
  torgIndex?: number;
  healthInsurance?: string;
}

export interface ParentContact {
  name: string;
  email?: string;
  phone?: string;
}

export interface PlayerFilters {
  searchTerm?: string;
  sport?: SportEnum;
  position?: PlayerPosition;
  category?: CategoryEnum;
  branch?: HockeyBranchEnum;
}

export interface Player extends Document {
  readonly id?: string;
  readonly idNumber: string;
  readonly name: string;
  readonly memberNumber?: string;
  readonly nickName?: string;
  readonly birthDate: Date;
  readonly email: string;
  readonly address?: Address;
  readonly sport?: SportEnum;
  readonly category?: CategoryEnum;
  readonly branch?: HockeyBranchEnum;
  readonly positions?: PlayerPosition[];
  readonly clothingSizes?: ClothingSizes;
  readonly medicalData?: MedicalData;
  readonly parentContacts?: ParentContact[];
  readonly photoId?: string;
  readonly userId?: string;
  readonly createdAt?: Date;
  readonly updatedAt?: Date;
}
