import { MatchStatusEnum, MatchTypeEnum } from '@ltrc-ps/shared-api-model';

export { sportOptions } from '../common/sport-options';
export { getCategoryOptionsBySport, getCategoryLabel } from '../common/category-options';

export interface MatchOption<T> {
  id: T;
  label: string;
}

export const matchStatusOptions: MatchOption<MatchStatusEnum>[] = [
  { id: MatchStatusEnum.UPCOMING, label: 'Próximo' },
  { id: MatchStatusEnum.COMPLETED, label: 'Finalizado' },
  { id: MatchStatusEnum.CANCELLED, label: 'Cancelado' },
];

export const matchTypeOptions: MatchOption<MatchTypeEnum>[] = [
  { id: MatchTypeEnum.LEAGUE, label: 'Liga' },
  { id: MatchTypeEnum.FRIENDLY, label: 'Amistoso' },
  { id: MatchTypeEnum.CUP, label: 'Copa' },
];
