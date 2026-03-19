import { RugbyPositions } from '@ltrc-campo/shared-api-model';

export const createPlayerDtoPlain = {
  name: 'Firstname 3 Lastname 3',
  idNumber: '3',
  birthDate: '05-12-2005',
  email: 'player3@lostordos.com.ar',
  positions: [RugbyPositions.FULLBACK],
  address: {
    phoneNumber: '123456789',
  },
};

export const playersArray = [
  {
    name: 'Firstname 1 Lastname 1',
    idNumber: '1',
    birthDate: '05-12-2005',
    email: 'player1@lostordos.com.ar',
    address: {
      street: 'Some Street 1',
      number: '100',
      neighborhood: 'Barrio 1',
      city: 'City',
      postalCode: '1000',
      phoneNumber: '123456789',
    },
    positions: [RugbyPositions.RIGHT_SECOND_ROW, RugbyPositions.LEFT_SECOND_ROW],
    height: 200,
    weight: 119,
  },
  {
    name: 'Firstname 2 Lastname 2',
    idNumber: '2',
    birthDate: '05-12-2005',
    email: 'player2@lostordos.com.ar',
    address: {
      street: 'Some Street 2',
      number: '200',
      neighborhood: 'Barrio 2',
      city: 'City',
      postalCode: '1000',
      phoneNumber: '987654321',
    },
    positions: [RugbyPositions.TIGHT_HEAD_PROP, RugbyPositions.LOOSE_HEAD_PROP],
    height: 180,
    weight: 100,
  },
  {
    name: 'Firstname 3 Lastname 3',
    idNumber: '3',
    birthDate: '05-12-2005',
    email: 'player3@lostordos.com.ar',
    address: {
      street: 'Some Street 3',
      number: '300',
      neighborhood: 'Barrio 3',
      city: 'City 3',
      postalCode: '3000',
      phoneNumber: '111222333',
    },
    positions: [RugbyPositions.LEFT_WING, RugbyPositions.FULLBACK],
    height: 200,
    weight: 119,
  },
];
