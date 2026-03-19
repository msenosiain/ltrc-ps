import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  CategoryEnum,
  MatchStatusEnum,
} from '@ltrc-campo/shared-api-model';

export function buildCreateMatchForm(fb: FormBuilder): FormGroup {
  return fb.group({
    date: [null, Validators.required],
    opponent: [''],
    venue: ['', Validators.required],
    isHome: [true],
    status: [MatchStatusEnum.UPCOMING],
    category: [null as CategoryEnum | null, Validators.required],
    division: [''],
    tournament: [null, Validators.required],
    result: fb.group({
      homeScore: [null],
      awayScore: [null],
    }),
    notes: [''],
  });
}
