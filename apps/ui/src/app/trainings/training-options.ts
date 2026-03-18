import {
  AttendanceStatusEnum,
  DayOfWeekEnum,
  TrainingSessionStatusEnum,
} from '@ltrc-ps/shared-api-model';

export { sportOptions } from '../common/sport-options';
export {
  getCategoryOptionsBySport,
  getCategoryLabel,
} from '../common/category-options';

export interface TrainingOption<T> {
  id: T;
  label: string;
}

export const dayOfWeekOptions: TrainingOption<DayOfWeekEnum>[] = [
  { id: DayOfWeekEnum.MONDAY, label: 'Lunes' },
  { id: DayOfWeekEnum.TUESDAY, label: 'Martes' },
  { id: DayOfWeekEnum.WEDNESDAY, label: 'Miércoles' },
  { id: DayOfWeekEnum.THURSDAY, label: 'Jueves' },
  { id: DayOfWeekEnum.FRIDAY, label: 'Viernes' },
  { id: DayOfWeekEnum.SATURDAY, label: 'Sábado' },
  { id: DayOfWeekEnum.SUNDAY, label: 'Domingo' },
];

export const sessionStatusOptions: TrainingOption<TrainingSessionStatusEnum>[] =
  [
    { id: TrainingSessionStatusEnum.SCHEDULED, label: 'Programada' },
    { id: TrainingSessionStatusEnum.COMPLETED, label: 'Completada' },
    { id: TrainingSessionStatusEnum.CANCELLED, label: 'Cancelada' },
  ];

export const attendanceStatusOptions: TrainingOption<AttendanceStatusEnum>[] = [
  { id: AttendanceStatusEnum.PRESENT, label: 'Presente' },
  { id: AttendanceStatusEnum.ABSENT, label: 'Ausente' },
  { id: AttendanceStatusEnum.JUSTIFIED, label: 'Justificado' },
];

export function getDayLabel(day?: DayOfWeekEnum | null): string {
  if (!day) return '';
  return dayOfWeekOptions.find((d) => d.id === day)?.label ?? day;
}

export function getSessionStatusLabel(
  status?: TrainingSessionStatusEnum | null
): string {
  if (!status) return '';
  return sessionStatusOptions.find((s) => s.id === status)?.label ?? status;
}

export function getAttendanceStatusLabel(
  status?: AttendanceStatusEnum | null
): string {
  if (!status) return '';
  return attendanceStatusOptions.find((s) => s.id === status)?.label ?? status;
}
