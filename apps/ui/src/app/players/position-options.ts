import {
  HockeyPositions,
  PlayerPosition,
  RugbyPositions,
  SportEnum,
} from '@ltrc-campo/shared-api-model';

export { SportOption, sportOptions } from '../common/sport-options';

export interface PositionOption {
  id: PlayerPosition;
  name: string;
  sport: SportEnum;
}

const rugbyTranslations: Record<RugbyPositions, string> = {
  [RugbyPositions.LOOSE_HEAD_PROP]: 'Pilar izquierdo',
  [RugbyPositions.HOOKER]: 'Hooker',
  [RugbyPositions.TIGHT_HEAD_PROP]: 'Pilar derecho',
  [RugbyPositions.LEFT_SECOND_ROW]: 'Segunda línea izquierda',
  [RugbyPositions.RIGHT_SECOND_ROW]: 'Segunda línea derecha',
  [RugbyPositions.BLINDSIDE_FLANKER]: 'Flanker ciego',
  [RugbyPositions.OPEN_SIDE_FLANKER]: 'Flanker abierto',
  [RugbyPositions.NUMBER_8]: 'Número 8',
  [RugbyPositions.SCRUM_HALF]: 'Medio scrum',
  [RugbyPositions.FLY_HALF]: 'Apertura',
  [RugbyPositions.LEFT_WING]: 'Wing izquierdo',
  [RugbyPositions.INSIDE_CENTRE]: 'Centro interno',
  [RugbyPositions.OUTSIDE_CENTRE]: 'Centro externo',
  [RugbyPositions.RIGHT_WING]: 'Wing derecho',
  [RugbyPositions.FULLBACK]: 'Full-back',
};

const hockeyTranslations: Record<HockeyPositions, string> = {
  [HockeyPositions.GOALKEEPER]: 'Arquera',
  [HockeyPositions.LIBERO]: 'Líbero',
  [HockeyPositions.STOPPER]: 'Stopper',
  [HockeyPositions.RIGHT_BACK]: 'Lateral derecha',
  [HockeyPositions.LEFT_BACK]: 'Lateral izquierda',
  [HockeyPositions.CENTRAL_MID]: 'Volante central',
  [HockeyPositions.RIGHT_INTERIOR]: 'Interior derecha',
  [HockeyPositions.LEFT_INTERIOR]: 'Interior izquierda',
  [HockeyPositions.RIGHT_WING]: 'Extrema derecha',
  [HockeyPositions.LEFT_WING]: 'Extrema izquierda',
  [HockeyPositions.CENTER_FORWARD]: 'Centrodelantera',
};

export const rugbyPositionOptions: PositionOption[] = (
  Object.values(RugbyPositions) as RugbyPositions[]
).map((p) => ({
  id: p,
  name: `${p} - ${rugbyTranslations[p]}`,
  sport: SportEnum.RUGBY,
}));

export const hockeyPositionOptions: PositionOption[] = (
  Object.values(HockeyPositions) as HockeyPositions[]
).map((p) => ({
  id: p,
  name: hockeyTranslations[p],
  sport: SportEnum.HOCKEY,
}));

export const positionOptions: PositionOption[] = [
  ...rugbyPositionOptions,
  ...hockeyPositionOptions,
];

export function getPositionOptionsBySport(
  sport?: SportEnum | null
): PositionOption[] {
  if (sport === SportEnum.RUGBY) return rugbyPositionOptions;
  if (sport === SportEnum.HOCKEY) return hockeyPositionOptions;
  return positionOptions;
}

export function getPositionLabel(
  position?: PlayerPosition | null,
  sport?: SportEnum | null
): string {
  if (!position) return '';
  if (sport === SportEnum.HOCKEY) {
    const label = hockeyTranslations[position as HockeyPositions];
    return label ?? position;
  }
  // rugby or unknown: try rugby first, then hockey
  const rugbyLabel = rugbyTranslations[position as RugbyPositions];
  if (rugbyLabel) return `${position} - ${rugbyLabel}`;
  const hockeyLabel = hockeyTranslations[position as HockeyPositions];
  return hockeyLabel ?? position;
}
