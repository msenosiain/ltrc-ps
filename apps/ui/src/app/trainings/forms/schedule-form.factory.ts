import { FormArray, FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  CategoryEnum,
  DayOfWeekEnum,
  SportEnum,
} from '@ltrc-ps/shared-api-model';

export function buildTimeSlotGroup(fb: FormBuilder): FormGroup {
  return fb.group({
    day: [null as DayOfWeekEnum | null, Validators.required],
    startTime: ['', Validators.required],
    endTime: ['', Validators.required],
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
