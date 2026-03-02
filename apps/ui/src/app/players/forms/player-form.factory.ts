import { FormBuilder, Validators } from '@angular/forms';
import {
  CategoryEnum,
  ClothingSizesEnum,
  PlayerPosition,
  SportEnum,
} from '@ltrc-ps/shared-api-model';
import { PhotoValue } from '../components/player-photo-field/player-photo-field.component';

export function buildCreatePlayerForm(fb: FormBuilder) {
  return fb.group({
    photo: fb.control<PhotoValue | null>(null),
    firstName: fb.nonNullable.control('', Validators.required),
    secondName: fb.nonNullable.control(''),
    lastName: fb.nonNullable.control('', Validators.required),
    nickName: fb.nonNullable.control(''),
    idNumber: fb.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(8),
    ]),
    birthDate: fb.control<Date | null>(null, Validators.required),
    email: fb.nonNullable.control('', [Validators.required, Validators.email]),

    sport: fb.control<SportEnum | null>(null),
    category: fb.control<CategoryEnum | null>(null),
    position: fb.control<PlayerPosition | null>(null, Validators.required),
    alternatePosition: fb.control<PlayerPosition | null>(null),

    address: fb.group({
      street: fb.nonNullable.control(''),
      number: fb.nonNullable.control(''),
      floorApartment: fb.nonNullable.control(''),
      city: fb.nonNullable.control(''),
      postalCode: fb.nonNullable.control(''),
      neighborhood: fb.nonNullable.control(''),
      phoneNumber: fb.nonNullable.control('', Validators.required),
    }),

    clothingSizes: fb.group({
      jersey: fb.control<ClothingSizesEnum | null>(null),
      shorts: fb.control<ClothingSizesEnum | null>(null),
      sweater: fb.control<ClothingSizesEnum | null>(null),
      pants: fb.control<ClothingSizesEnum | null>(null),
    }),

    medicalData: fb.group({
      height: fb.control<number | null>(null),
      weight: fb.control<number | null>(null),
      torgIndex: fb.control<number | null>(null),
      healthInsurance: fb.nonNullable.control(''),
    }),
  });
}
