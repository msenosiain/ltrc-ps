import { Document, Types } from 'mongoose';
import {
  PlayerPositionEnum,
  ClothingSizesEnum,
} from '@ltrc-ps/shared-api-model';

export class PlayerEntity extends Document {
  id: string;
  idNumber: string;
  lastName: string;
  firstName: string;
  nickName: string;
  birthDate: Date;
  email: string;
  address: {
    street?: string;
    number?: string;
    floorApartment?: string;
    neighborhood?: string;
    city?: string;
    postalCode?: string;
    phoneNumber: string;
  };
  position: PlayerPositionEnum;
  alternatePosition?: PlayerPositionEnum;
  height?: number;
  weight?: number;
  clothingSizes?: {
    jersey?: ClothingSizesEnum;
    shorts?: ClothingSizesEnum;
    sweater?: ClothingSizesEnum;
    pants?: ClothingSizesEnum;
  };
  photoId?: string;
  userId?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}
