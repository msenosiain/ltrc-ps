import { format } from 'date-fns';
import { DATE_FORMAT } from '@ltrc-ps/shared-api-model';
import { ScheduleFormValue } from './schedule-form.types';

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
        startTime: s.startTime,
        endTime: s.endTime,
        location: s.location || undefined,
      })),
  };
}
