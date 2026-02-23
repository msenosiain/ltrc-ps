import {
  ClothingSizesEnum,
  PlayerPositionEnum,
} from '@ltrc-ps/shared-api-model';

export type PlayerFormValue = {
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
    city: string;
    province: string;
    postalCode: string;
    country: string;
    phoneNumber: string;
  };

  clothingSizes: {
    jersey: ClothingSizesEnum | null;
    shorts: ClothingSizesEnum | null;
    sweater: ClothingSizesEnum | null;
    pants: ClothingSizesEnum | null;
  };
};
