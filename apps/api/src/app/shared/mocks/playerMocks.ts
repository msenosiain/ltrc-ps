import { RugbyPositions } from '@ltrc-ps/shared-api-model';

export const createPlayerDtoPlain = {
  lastName: 'Lastname 3',
  firstName: 'Firstname 3',
  idNumber: '3',
  birthDate: '05-12-2005',
  email: 'player3@lostordos.com.ar',
  position: RugbyPositions.FULLBACK,
  address: {
    phoneNumber: '123456789',
  },
};

export const playersArray = [
  {
    lastName: 'Lastname 1',
    firstName: 'Firstname 1',
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
    position: RugbyPositions.RIGHT_SECOND_ROW,
    alternatePosition: RugbyPositions.LEFT_SECOND_ROW,
    height: 200,
    weight: 119,
  },
  {
    lastName: 'Lastname 2',
    firstName: 'Firstname 2',
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
    position: RugbyPositions.TIGHT_HEAD_PROP,
    alternatePosition: RugbyPositions.LOOSE_HEAD_PROP,
    height: 180,
    weight: 100,
  },
  {
    lastName: 'Lastname 3',
    firstName: 'Firstname 3',
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
    position: RugbyPositions.LEFT_WING,
    alternatePosition: RugbyPositions.FULLBACK,
    height: 200,
    weight: 119,
  },
];
