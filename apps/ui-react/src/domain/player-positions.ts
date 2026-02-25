import { PlayerPositionEnum } from './player';

export interface PositionOption {
  value: PlayerPositionEnum;
  label: string;
  number: number;
}

export const POSITION_OPTIONS: PositionOption[] = [
  { value: PlayerPositionEnum.LOOSE_HEAD_PROP, label: '1 — Loose-head prop', number: 1 },
  { value: PlayerPositionEnum.HOOKER, label: '2 — Hooker', number: 2 },
  { value: PlayerPositionEnum.TIGHT_HEAD_PROP, label: '3 — Tight-head prop', number: 3 },
  { value: PlayerPositionEnum.LEFT_SECOND_ROW, label: '4 — Left Second-row', number: 4 },
  { value: PlayerPositionEnum.RIGHT_SECOND_ROW, label: '5 — Right Second-row', number: 5 },
  { value: PlayerPositionEnum.BLINDSIDE_FLANKER, label: '6 — Blindside flanker', number: 6 },
  { value: PlayerPositionEnum.OPEN_SIDE_FLANKER, label: '7 — Open side flanker', number: 7 },
  { value: PlayerPositionEnum.NUMBER_8, label: '8 — Number 8', number: 8 },
  { value: PlayerPositionEnum.SCRUM_HALF, label: '9 — Scrum-half', number: 9 },
  { value: PlayerPositionEnum.FLY_HALF, label: '10 — Fly-half', number: 10 },
  { value: PlayerPositionEnum.LEFT_WING, label: '11 — Left wing', number: 11 },
  { value: PlayerPositionEnum.INSIDE_CENTRE, label: '12 — Inside centre', number: 12 },
  { value: PlayerPositionEnum.OUTSIDE_CENTRE, label: '13 — Outside centre', number: 13 },
  { value: PlayerPositionEnum.RIGHT_WING, label: '14 — Right wing', number: 14 },
  { value: PlayerPositionEnum.FULLBACK, label: '15 — Full-back', number: 15 },
];
