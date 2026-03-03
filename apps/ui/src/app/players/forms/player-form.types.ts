import {
  CategoryEnum,
  ClothingSizesEnum,
  PlayerPosition,
  SportEnum,
} from '@ltrc-ps/shared-api-model';
import { PhotoValue } from '../components/player-photo-field/player-photo-field.component';

export type PlayerFormValue = {
  photo?: PhotoValue | null;
  createUser?: boolean;

  firstName: string;
  secondName: string;
  lastName: string;
  nickName: string;
  idNumber: string;
  birthDate: Date | null;
  email: string;

  sport: SportEnum | null;
  category: CategoryEnum | null;
  position: PlayerPosition | null;
  alternatePosition: PlayerPosition | null;

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

  medicalData: {
    height: number | null;
    weight: number | null;
    torgIndex: number | null;
    healthInsurance: string;
  };
};
