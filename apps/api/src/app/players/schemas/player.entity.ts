import { Document, Types } from 'mongoose';
import {
  CategoryEnum,
  ClothingSizesEnum,
  HockeyBranchEnum,
  PlayerPosition,
  SportEnum,
} from '@ltrc-ps/shared-api-model';

export class PlayerEntity extends Document {
  id: string;
  idNumber: string;
  lastName: string;
  firstName: string;
  secondName?: string;
  nickName: string;
  birthDate: Date;
  email: string;
  address?: {
    street?: string;
    number?: string;
    floorApartment?: string;
    neighborhood?: string;
    city?: string;
    postalCode?: string;
    phoneNumber: string;
  };
  sport?: SportEnum;
  category?: CategoryEnum;
  branch?: HockeyBranchEnum;
  position?: PlayerPosition;
  alternatePosition?: PlayerPosition;
  clothingSizes?: {
    jersey?: ClothingSizesEnum;
    shorts?: ClothingSizesEnum;
    sweater?: ClothingSizesEnum;
    pants?: ClothingSizesEnum;
  };
  medicalData?: {
    height?: number;
    weight?: number;
    torgIndex?: number;
    healthInsurance?: string;
  };
  photoId?: string;
  userId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
