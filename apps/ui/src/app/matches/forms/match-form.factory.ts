import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  CategoryEnum,
  MatchStatusEnum,
  SportEnum,
} from '@ltrc-campo/shared-api-model';

export function buildCreateMatchForm(fb: FormBuilder): FormGroup {
  return fb.group({
    date: [null, Validators.required],
    opponent: [''],
    venue: ['', Validators.required],
    isHome: [true],
    status: [MatchStatusEnum.UPCOMING],
    sport: [null as SportEnum | null],
    category: [null as CategoryEnum | null, Validators.required],
    division: [''],
    branch: [null],
    tournament: ['' as string],
    result: fb.group({
      homeScore: [null],
      awayScore: [null],
    }),
    notes: [''],
  });
}
