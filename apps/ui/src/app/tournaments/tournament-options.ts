import { MatchTypeEnum } from '@ltrc-campo/shared-api-model';

export interface MatchOption<T> {
  id: T;
  label: string;
}

export const matchTypeOptions: MatchOption<MatchTypeEnum>[] = [
  { id: MatchTypeEnum.LEAGUE, label: 'Liga' },
  { id: MatchTypeEnum.FRIENDLY, label: 'Amistoso' },
  { id: MatchTypeEnum.CUP, label: 'Copa' },
  { id: MatchTypeEnum.ENCOUNTER, label: 'Encuentro' },
];
