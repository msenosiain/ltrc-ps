import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  CategoryEnum,
  DayOfWeekEnum,
  SportEnum,
} from '@ltrc-campo/shared-api-model';

export function buildTimeSlotGroup(fb: FormBuilder): FormGroup {
  return fb.group({
    day: [null as DayOfWeekEnum | null, Validators.required],
    startTime: [null as string | null, Validators.required],
    endTime: [null as string | null, Validators.required],
    location: [''],
  });
}

export function buildCreateScheduleForm(fb: FormBuilder): FormGroup {
  return fb.group({
    sport: [null as SportEnum | null, Validators.required],
    category: [null as CategoryEnum | null, Validators.required],
    division: [''],
    isActive: [true],
    validFrom: [null],
    validUntil: [null],
    timeSlots: fb.array([buildTimeSlotGroup(fb)]),
  });
}

export function getTimeSlotsArray(form: FormGroup): FormArray {
  return form.get('timeSlots') as FormArray;
}
