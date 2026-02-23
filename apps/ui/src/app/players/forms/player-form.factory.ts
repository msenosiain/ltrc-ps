import { FormBuilder, Validators } from '@angular/forms';
import {
  ClothingSizesEnum,
  PlayerPositionEnum,
} from '@ltrc-ps/shared-api-model';

export function buildCreatePlayerForm(fb: FormBuilder) {
  return fb.group({
    photo: [null],
    firstName: fb.nonNullable.control('', Validators.required),
    lastName: fb.nonNullable.control('', Validators.required),
    nickName: fb.nonNullable.control(''),
    idNumber: fb.nonNullable.control('', [
      Validators.required,
      Validators.maxLength(8),
    ]),
    birthDate: fb.control<Date | null>(null, Validators.required),
    email: fb.nonNullable.control('', [Validators.required, Validators.email]),

    position: fb.control<PlayerPositionEnum | null>(null, Validators.required),
    alternatePosition: fb.control<PlayerPositionEnum | null>(null),

    height: fb.control<number | null>(null),
    weight: fb.control<number | null>(null),

    address: fb.group({
      street: fb.nonNullable.control(''),
      number: fb.nonNullable.control(''),
      city: fb.nonNullable.control(''),
      province: fb.nonNullable.control(''),
      postalCode: fb.nonNullable.control(''),
      country: fb.nonNullable.control(''),
      phoneNumber: fb.nonNullable.control('', Validators.required),
    }),

    clothingSizes: fb.group({
      jersey: fb.control<ClothingSizesEnum | null>(null),
      shorts: fb.control<ClothingSizesEnum | null>(null),
      sweater: fb.control<ClothingSizesEnum | null>(null),
      pants: fb.control<ClothingSizesEnum | null>(null),
    }),
  });
}
