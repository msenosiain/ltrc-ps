import { PlayerFormValue } from './player-form.types';
import { Player } from '@ltrc-ps/shared-api-model';

/**
 * FORM → CREATE DTO (NestJS)
 */
export function mapFormToCreatePlayerDto(value: PlayerFormValue) {
  return {
    firstName: value.firstName,
    lastName: value.lastName,
    nickName: value.nickName || undefined,
    idNumber: value.idNumber,
    birthDate: value.birthDate!,
    email: value.email,
    position: value.position!,
    alternatePosition: value.alternatePosition ?? undefined,
    size: value.height ?? undefined,
    weight: value.weight ?? undefined,
    address: mapAddress(value),
    clothingSizes: mapClothingSizes(value),
  };
}

/**
 * PLAYER → FORM (EDIT)
 */
export function mapPlayerToForm(player: Player): PlayerFormValue {
  return {
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
      city: player.address?.city ?? '',
      province: player.address?.province ?? '',
      postalCode: player.address?.postalCode ?? '',
      country: player.address?.country ?? '',
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

/* ----------------- helpers ----------------- */

function mapAddress(value: PlayerFormValue) {
  const address = value.address;

  if (!address.phoneNumber) return undefined;

  return {
    street: address.street || undefined,
    number: address.number || undefined,
    city: address.city || undefined,
    province: address.province || undefined,
    postalCode: address.postalCode || undefined,
    country: address.country || undefined,
    phoneNumber: address.phoneNumber,
  };
}

function mapClothingSizes(value: PlayerFormValue) {
  const clothing = {
    jersey: value.clothingSizes.jersey ?? undefined,
    shorts: value.clothingSizes.shorts ?? undefined,
    sweater: value.clothingSizes.sweater ?? undefined,
    pants: value.clothingSizes.pants ?? undefined,
  };

  return Object.values(clothing).some((v) => v !== undefined)
    ? clothing
    : undefined;
}
