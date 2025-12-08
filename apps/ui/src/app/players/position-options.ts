import { PlayerPositionEnum } from '@ltrc-ps/shared-api-model';

export interface PositionOption {
  id: PlayerPositionEnum;
  name: string;
}

const positionTranslations: Record<PlayerPositionEnum, string> = {
  [PlayerPositionEnum.LOOSE_HEAD_PROP]: 'Pilar izquierdo',
  [PlayerPositionEnum.HOOKER]: 'Hooker',
  [PlayerPositionEnum.TIGHT_HEAD_PROP]: 'Pilar derecho',
  [PlayerPositionEnum.LEFT_SECOND_ROW]: 'Segunda línea izquierda',
  [PlayerPositionEnum.RIGHT_SECOND_ROW]: 'Segunda línea derecha',
  [PlayerPositionEnum.BLINDSIDE_FLANKER]: 'Flanker ciego',
  [PlayerPositionEnum.OPEN_SIDE_FLANKER]: 'Flanker abierto',
  [PlayerPositionEnum.NUMBER_8]: 'Número 8',
  [PlayerPositionEnum.SCRUM_HALF]: 'Medio scrum',
  [PlayerPositionEnum.FLY_HALF]: 'Apertura',
  [PlayerPositionEnum.LEFT_WING]: 'Wing izquierdo',
  [PlayerPositionEnum.INSIDE_CENTRE]: 'Centro interno',
  [PlayerPositionEnum.OUTSIDE_CENTRE]: 'Centro externo',
  [PlayerPositionEnum.RIGHT_WING]: 'Wing derecho',
  [PlayerPositionEnum.FULLBACK]: 'Full-back'
};

export const positionOptions: PositionOption[] = Object.values(PlayerPositionEnum).map(p => ({
  id: p,
  name: positionTranslations[p]
}));
