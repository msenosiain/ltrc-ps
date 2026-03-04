import { SportEnum } from '@ltrc-ps/shared-api-model';

export interface SportOption {
  id: SportEnum;
  label: string;
}

export const sportOptions: SportOption[] = [
  { id: SportEnum.RUGBY, label: 'Rugby' },
  { id: SportEnum.HOCKEY, label: 'Hockey' },
];

export function getSportLabel(id?: SportEnum | null): string {
  if (!id) return '';
  return sportOptions.find((s) => s.id === id)?.label ?? id;
}
