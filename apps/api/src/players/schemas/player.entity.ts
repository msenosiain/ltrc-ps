import { Document } from 'mongoose';
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
    city?: string;
    province?: string;
    postalCode?: string;
    country?: string;
    phoneNumber: string;
  };
  position: PlayerPositionEnum;
  alternatePosition?: PlayerPositionEnum;
  size?: number;
  weight?: number;
  clothingSizes?: {
    jersey?: ClothingSizesEnum;
    shorts?: ClothingSizesEnum;
    sweater?: ClothingSizesEnum;
    pants?: ClothingSizesEnum;
  };
  photoId?: string;
  createdAt: Date;
  updatedAt: Date;
}
