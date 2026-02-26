import { mapFormToCreatePlayerDto, mapPlayerToForm } from './player-form.mapper';
import { PlayerFormValue } from './player-form.types';
import { Player } from '@ltrc-ps/shared-api-model';
import { PlayerPositionEnum, ClothingSizesEnum } from '@ltrc-ps/shared-api-model';

const baseForm: PlayerFormValue = {
  firstName: 'Juan',
  lastName: 'Perez',
  nickName: 'Juancho',
  idNumber: '12345678',
  birthDate: new Date('2000-01-15'),
  email: 'juan@lostordos.com.ar',
  position: PlayerPositionEnum.FULLBACK,
  alternatePosition: null,
  height: 180,
  weight: 85,
  photo: null,
  address: {
    street: 'Av. Siempreviva',
    number: '742',
    floorApartment: '3B',
    neighborhood: 'Palermo',
    city: 'Buenos Aires',
    postalCode: '1425',
    phoneNumber: '1112345678',
  },
  clothingSizes: {
    jersey: ClothingSizesEnum.L,
    shorts: ClothingSizesEnum.M,
    sweater: null,
    pants: null,
  },
};

const basePlayer: Player = {
  id: 'player-1',
  firstName: 'Juan',
  lastName: 'Perez',
  nickName: 'Juancho',
  idNumber: '12345678',
  birthDate: new Date('2000-01-15'),
  email: 'juan@lostordos.com.ar',
  position: PlayerPositionEnum.FULLBACK,
  alternatePosition: PlayerPositionEnum.LEFT_WING,
  height: 180,
  weight: 85,
  address: {
    street: 'Av. Siempreviva',
    number: '742',
    floorApartment: '3B',
    neighborhood: 'Palermo',
    city: 'Buenos Aires',
    postalCode: '1425',
    phoneNumber: '1112345678',
  },
  clothingSizes: {
    jersey: ClothingSizesEnum.L,
    shorts: ClothingSizesEnum.M,
  },
} as unknown as Player;

describe('mapFormToCreatePlayerDto', () => {
  it('should map required fields correctly', () => {
    const result = mapFormToCreatePlayerDto(baseForm);
    expect(result.firstName).toBe('Juan');
    expect(result.lastName).toBe('Perez');
    expect(result.idNumber).toBe('12345678');
    expect(result.email).toBe('juan@lostordos.com.ar');
    expect(result.position).toBe(PlayerPositionEnum.FULLBACK);
    expect(result.birthDate).toEqual(baseForm.birthDate);
  });

  it('should map height and weight', () => {
    const result = mapFormToCreatePlayerDto(baseForm);
    expect(result.height).toBe(180);
    expect(result.weight).toBe(85);
  });

  it('should map address with new fields', () => {
    const result = mapFormToCreatePlayerDto(baseForm);
    expect(result.address?.floorApartment).toBe('3B');
    expect(result.address?.neighborhood).toBe('Palermo');
    expect(result.address?.street).toBe('Av. Siempreviva');
    expect(result.address?.city).toBe('Buenos Aires');
    expect(result.address?.phoneNumber).toBe('1112345678');
  });

  it('should return undefined address when phoneNumber is empty', () => {
    const form = { ...baseForm, address: { ...baseForm.address, phoneNumber: '' } };
    const result = mapFormToCreatePlayerDto(form);
    expect(result.address).toBeUndefined();
  });

  it('should omit empty nickName', () => {
    const form = { ...baseForm, nickName: '' };
    const result = mapFormToCreatePlayerDto(form);
    expect(result.nickName).toBeUndefined();
  });

  it('should map clothingSizes when at least one is set', () => {
    const result = mapFormToCreatePlayerDto(baseForm);
    expect(result.clothingSizes?.jersey).toBe(ClothingSizesEnum.L);
    expect(result.clothingSizes?.shorts).toBe(ClothingSizesEnum.M);
    expect(result.clothingSizes?.sweater).toBeUndefined();
  });

  it('should return undefined clothingSizes when all are null', () => {
    const form = { ...baseForm, clothingSizes: { jersey: null, shorts: null, sweater: null, pants: null } };
    const result = mapFormToCreatePlayerDto(form);
    expect(result.clothingSizes).toBeUndefined();
  });
});

describe('mapPlayerToForm', () => {
  it('should map player fields to form', () => {
    const result = mapPlayerToForm(basePlayer);
    expect(result.firstName).toBe('Juan');
    expect(result.lastName).toBe('Perez');
    expect(result.nickName).toBe('Juancho');
    expect(result.idNumber).toBe('12345678');
    expect(result.email).toBe('juan@lostordos.com.ar');
    expect(result.position).toBe(PlayerPositionEnum.FULLBACK);
    expect(result.alternatePosition).toBe(PlayerPositionEnum.LEFT_WING);
    expect(result.height).toBe(180);
    expect(result.weight).toBe(85);
  });

  it('should map address with floorApartment and neighborhood', () => {
    const result = mapPlayerToForm(basePlayer);
    expect(result.address.floorApartment).toBe('3B');
    expect(result.address.neighborhood).toBe('Palermo');
    expect(result.address.street).toBe('Av. Siempreviva');
    expect(result.address.phoneNumber).toBe('1112345678');
  });

  it('should default address fields to empty strings when missing', () => {
    const player = { ...basePlayer, address: { phoneNumber: '123' } } as unknown as Player;
    const result = mapPlayerToForm(player);
    expect(result.address.street).toBe('');
    expect(result.address.number).toBe('');
    expect(result.address.floorApartment).toBe('');
    expect(result.address.neighborhood).toBe('');
    expect(result.address.city).toBe('');
  });

  it('should default alternatePosition to null when absent', () => {
    const player = { ...basePlayer, alternatePosition: undefined } as unknown as Player;
    const result = mapPlayerToForm(player);
    expect(result.alternatePosition).toBeNull();
  });

  it('should set photo to null (existing photo managed separately)', () => {
    const result = mapPlayerToForm(basePlayer);
    expect(result.photo).toBeNull();
  });

  it('should default clothing sizes to null when absent', () => {
    const player = { ...basePlayer, clothingSizes: undefined } as unknown as Player;
    const result = mapPlayerToForm(player);
    expect(result.clothingSizes.jersey).toBeNull();
    expect(result.clothingSizes.shorts).toBeNull();
    expect(result.clothingSizes.sweater).toBeNull();
    expect(result.clothingSizes.pants).toBeNull();
  });
});