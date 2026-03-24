import { format } from 'date-fns';
import { ScheduleFormValue } from './schedule-form.types';

const API_DATE_FORMAT = 'yyyy-MM-dd';

export function mapFormToCreateScheduleDto(value: ScheduleFormValue) {
  return {
    sport: value.sport!,
    category: value.category!,
    division: value.division || undefined,
    isActive: value.isActive,
    validFrom: value.validFrom
      ? format(value.validFrom, API_DATE_FORMAT)
      : undefined,
    validUntil: value.validUntil
      ? format(value.validUntil, API_DATE_FORMAT)
      : undefined,
    timeSlots: value.timeSlots
      .filter((s) => s.day && s.startTime && s.endTime)
      .map((s) => ({
        day: s.day!,
        startTime: s.startTime as string,
        endTime: s.endTime as string,
        location: s.location || undefined,
      })),
  };
}
