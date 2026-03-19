import { format } from 'date-fns';
import { DATE_FORMAT } from '@ltrc-campo/shared-api-model';
import { ScheduleFormValue } from './schedule-form.types';

function timeToString(d: Date | null): string {
  if (!d) return '';
  const h = String(d.getHours()).padStart(2, '0');
  const m = String(d.getMinutes()).padStart(2, '0');
  return `${h}:${m}`;
}

export function timeStringToDate(time: string): Date | null {
  if (!time) return null;
  const [h, m] = time.split(':').map(Number);
  const d = new Date();
  d.setHours(h, m, 0, 0);
  return d;
}

export function mapFormToCreateScheduleDto(value: ScheduleFormValue) {
  return {
    sport: value.sport!,
    category: value.category!,
    division: value.division || undefined,
    isActive: value.isActive,
    validFrom: value.validFrom
      ? format(value.validFrom, DATE_FORMAT)
      : undefined,
    validUntil: value.validUntil
      ? format(value.validUntil, DATE_FORMAT)
      : undefined,
    timeSlots: value.timeSlots
      .filter((s) => s.day && s.startTime && s.endTime)
      .map((s) => ({
        day: s.day!,
        startTime: timeToString(s.startTime),
        endTime: timeToString(s.endTime),
        location: s.location || undefined,
      })),
  };
}
