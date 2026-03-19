import {
  CategoryEnum,
  DayOfWeekEnum,
  SportEnum,
} from '@ltrc-campo/shared-api-model';

export interface TimeSlotFormValue {
  day: DayOfWeekEnum | null;
  startTime: Date | null;
  endTime: Date | null;
  location: string;
}

export interface ScheduleFormValue {
  sport: SportEnum | null;
  category: CategoryEnum | null;
  division: string;
  isActive: boolean;
  validFrom: Date | null;
  validUntil: Date | null;
  timeSlots: TimeSlotFormValue[];
}

export interface ScheduleFilters {
  sport?: SportEnum;
  category?: CategoryEnum;
  isActive?: boolean;
}
