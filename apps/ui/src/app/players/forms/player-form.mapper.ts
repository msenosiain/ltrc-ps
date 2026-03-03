import { Player, DATE_FORMAT } from '@ltrc-ps/shared-api-model';
import { PlayerFormValue } from './player-form.types';
import { format } from 'date-fns';

// FORM -> CREATE DTO (NestJS)
export function mapFormToCreatePlayerDto(value: PlayerFormValue) {
  return {
    firstName: value.firstName,
    secondName: value.secondName || undefined,
    lastName: value.lastName,
    nickName: value.nickName || undefined,
    idNumber: value.idNumber,
    birthDate: format(value.birthDate!, DATE_FORMAT),
    email: value.email,
    sport: value.sport ?? undefined,
    category: value.category ?? undefined,
    position: value.position!,
    alternatePosition: value.alternatePosition ?? undefined,
    address: mapAddress(value),
    clothingSizes: mapClothingSizes(value),
    medicalData: mapMedicalData(value),
    createUser: value.createUser ?? false,
  };
}

// PLAYER -> FORM (EDIT)
export function mapPlayerToForm(player: Player): PlayerFormValue {
  return {
    photo: null, // la foto existente se maneja via existingPhotoUrl, no como PhotoValue

    firstName: player.firstName,
    secondName: player.secondName ?? '',
    lastName: player.lastName,
    nickName: player.nickName ?? '',
    idNumber: player.idNumber,
    birthDate: player.birthDate,
    email: player.email,

    sport: player.sport ?? null,
    category: player.category ?? null,
    position: player.position ?? null,
    alternatePosition: player.alternatePosition ?? null,

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

    medicalData: {
      height: player.medicalData?.height ?? null,
      weight: player.medicalData?.weight ?? null,
      torgIndex: player.medicalData?.torgIndex ?? null,
      healthInsurance: player.medicalData?.healthInsurance ?? '',
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

function mapMedicalData(value: PlayerFormValue) {
  const m = {
    height: value.medicalData.height ?? undefined,
    weight: value.medicalData.weight ?? undefined,
    torgIndex: value.medicalData.torgIndex ?? undefined,
    healthInsurance: value.medicalData.healthInsurance || undefined,
  };
  return Object.values(m).some((v) => v !== undefined) ? m : undefined;
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
