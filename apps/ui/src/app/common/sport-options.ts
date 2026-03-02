import { SportEnum } from '@ltrc-ps/shared-api-model';

export interface SportOption {
  id: SportEnum;
  label: string;
}

export const sportOptions: SportOption[] = [
  { id: SportEnum.RUGBY, label: 'Rugby' },
  { id: SportEnum.HOCKEY, label: 'Hockey' },
];
