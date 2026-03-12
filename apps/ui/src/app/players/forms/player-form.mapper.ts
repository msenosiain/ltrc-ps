import { Player, DATE_FORMAT } from '@ltrc-ps/shared-api-model';
import { PlayerFormValue } from './player-form.types';
import { format } from 'date-fns';

// FORM -> CREATE DTO (NestJS)
export function mapFormToCreatePlayerDto(value: PlayerFormValue) {
  return {
    name: value.name,
    memberNumber: value.memberNumber || undefined,
    nickName: value.nickName || undefined,
    idNumber: value.idNumber,
    birthDate: format(value.birthDate!, DATE_FORMAT),
    email: value.email,
    sport: value.sport ?? undefined,
    category: value.category ?? undefined,
    branch: value.branch ?? undefined,
    position: value.position!,
    alternatePosition: value.alternatePosition ?? undefined,
    address: mapAddress(value),
    clothingSizes: mapClothingSizes(value),
    medicalData: mapMedicalData(value),
    parentContact: mapParentContact(value),
    createUser: value.createUser ?? false,
  };
}

// PLAYER -> FORM (EDIT)
export function mapPlayerToForm(player: Player): PlayerFormValue {
  return {
    photo: null, // la foto existente se maneja via existingPhotoUrl, no como PhotoValue

    name: player.name,
    memberNumber: player.memberNumber ?? '',
    nickName: player.nickName ?? '',
    idNumber: player.idNumber,
    birthDate: player.birthDate,
    email: player.email,

    sport: player.sport ?? null,
    category: player.category ?? null,
    branch: player.branch ?? null,
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

    parentContact: {
      name: player.parentContact?.name ?? '',
      email: player.parentContact?.email ?? '',
      phone: player.parentContact?.phone ?? '',
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

function mapParentContact(value: PlayerFormValue) {
  const pc = value.parentContact;
  if (!pc.name) return undefined;
  return {
    name: pc.name,
    email: pc.email || undefined,
    phone: pc.phone || undefined,
  };
}
