import {
  ClothingSizesEnum,
  PlayerPositionEnum,
} from '@ltrc-ps/shared-api-model';
import { PhotoValue } from '../components/player-photo-field/player-photo-field.component';

export type PlayerFormValue = {
  photo?: PhotoValue | null;
  createUser?: boolean;

  firstName: string;
  lastName: string;
  nickName: string;
  idNumber: string;
  birthDate: Date | null;
  email: string;

  position: PlayerPositionEnum | null;
  alternatePosition: PlayerPositionEnum | null;

  height: number | null;
  weight: number | null;

  address: {
    street: string;
    number: string;
    floorApartment: string;
    city: string;
    postalCode: string;
    neighborhood: string;
    phoneNumber: string;
  };

  clothingSizes: {
    jersey: ClothingSizesEnum | null;
    shorts: ClothingSizesEnum | null;
    sweater: ClothingSizesEnum | null;
    pants: ClothingSizesEnum | null;
  };
};
