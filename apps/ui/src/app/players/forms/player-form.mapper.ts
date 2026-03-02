import { Player, DATE_FORMAT } from '@ltrc-ps/shared-api-model';
import { PlayerFormValue } from './player-form.types';
import { format } from 'date-fns';

// FORM -> CREATE DTO (NestJS)
export function mapFormToCreatePlayerDto(value: PlayerFormValue) {
  return {
    firstName: value.firstName,
    lastName: value.lastName,
    nickName: value.nickName || undefined,
    idNumber: value.idNumber,
    birthDate: format(value.birthDate!, DATE_FORMAT),
    email: value.email,
    position: value.position!,
    alternatePosition: value.alternatePosition ?? undefined,
    height: value.height ?? undefined,
    weight: value.weight ?? undefined,
    address: mapAddress(value),
    clothingSizes: mapClothingSizes(value),
    createUser: value.createUser ?? false,
  };
}

// PLAYER -> FORM (EDIT)
export function mapPlayerToForm(player: Player): PlayerFormValue {
  return {
    photo: null, // la foto existente se maneja via existingPhotoUrl, no como PhotoValue

    firstName: player.firstName,
    lastName: player.lastName,
    nickName: player.nickName ?? '',
    idNumber: player.idNumber,
    birthDate: player.birthDate,
    email: player.email,

    position: player.position,
    alternatePosition: player.alternatePosition ?? null,

    height: player.height ?? null,
    weight: player.weight ?? null,

    address: {
      street: player.address?.street ?? '',
      number: player.address?.number ?? '',
      floorApartment: player.address?.floorApartment ?? '',
      city: player.address?.city ?? '',
      postalCode: player.address?.postalCode ?? '',
      neighborhood: player.address?.neighborhood ?? '',
      phoneNumber: player.address?.phoneNumber ?? '',
    },

    clothingSizes: {
      jersey: player.clothingSizes?.jersey ?? null,
      shorts: player.clothingSizes?.shorts ?? null,
      sweater: player.clothingSizes?.sweater ?? null,
      pants: player.clothingSizes?.pants ?? null,
    },
  };
}

// helpers

function mapAddress(value: PlayerFormValue) {
  const a = value.address;
  if (!a.phoneNumber) return undefined;

  return {
    street: a.street || undefined,
    number: a.number || undefined,
    floorApartment: a.floorApartment || undefined,
    city: a.city || undefined,
    postalCode: a.postalCode || undefined,
    neighborhood: a.neighborhood || undefined,
    phoneNumber: a.phoneNumber,
  };
}

function mapClothingSizes(value: PlayerFormValue) {
  const c = {
    jersey: value.clothingSizes.jersey ?? undefined,
    shorts: value.clothingSizes.shorts ?? undefined,
    sweater: value.clothingSizes.sweater ?? undefined,
    pants: value.clothingSizes.pants ?? undefined,
  };
  return Object.values(c).some((v) => v !== undefined) ? c : undefined;
}
