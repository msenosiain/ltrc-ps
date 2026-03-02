import { FormBuilder, Validators } from '@angular/forms';
import {
  ClothingSizesEnum,
  PlayerPositionEnum,
} from '@ltrc-ps/shared-api-model';
import { PhotoValue } from '../components/player-photo-field/player-photo-field.component';

export function buildCreatePlayerForm(fb: FormBuilder) {
  return fb.group({
    photo: fb.control<PhotoValue | null>(null),
    createUser: fb.nonNullable.control(false),
    firstName: fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(2),
      Validators.pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/),
    ]),
    lastName: fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(2),
      Validators.pattern(/^[a-zA-ZÀ-ÿ\s'-]+$/),
    ]),
    nickName: fb.nonNullable.control(''),
    idNumber: fb.nonNullable.control('', [
      Validators.required,
      Validators.minLength(7),
      Validators.maxLength(8),
      Validators.pattern(/^\d{7,8}$/),
    ]),
    birthDate: fb.control<Date | null>(null, Validators.required),
    email: fb.nonNullable.control('', [Validators.required, Validators.email]),

    position: fb.control<PlayerPositionEnum | null>(null, Validators.required),
    alternatePosition: fb.control<PlayerPositionEnum | null>(null),

    height: fb.control<number | null>(null, [Validators.min(100), Validators.max(230)]),
    weight: fb.control<number | null>(null, [Validators.min(30), Validators.max(200)]),

    address: fb.group({
      street: fb.nonNullable.control(''),
      number: fb.nonNullable.control(''),
      floorApartment: fb.nonNullable.control(''),
      city: fb.nonNullable.control(''),
      postalCode: fb.nonNullable.control(''),
      neighborhood: fb.nonNullable.control(''),
      phoneNumber: fb.nonNullable.control('', [
        Validators.required,
        Validators.pattern(/^[\d\s\+\-\(\)]{6,20}$/),
      ]),
    }),

    clothingSizes: fb.group({
      jersey: fb.control<ClothingSizesEnum | null>(null),
      shorts: fb.control<ClothingSizesEnum | null>(null),
      sweater: fb.control<ClothingSizesEnum | null>(null),
      pants: fb.control<ClothingSizesEnum | null>(null),
    }),
  });
}
