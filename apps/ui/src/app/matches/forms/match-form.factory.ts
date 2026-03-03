import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import {
  CategoryEnum,
  MatchStatusEnum,
  MatchTypeEnum,
  SportEnum,
} from '@ltrc-ps/shared-api-model';

export function buildCreateMatchForm(fb: FormBuilder): FormGroup {
  return fb.group({
    date: [null, Validators.required],
    opponent: ['', Validators.required],
    venue: ['', Validators.required],
    isHome: [true],
    type: [MatchTypeEnum.LEAGUE, Validators.required],
    status: [MatchStatusEnum.UPCOMING],
    sport: [null as SportEnum | null],
    category: [null as CategoryEnum | null],
    division: [''],
    tournament: [null],
    result: fb.group({
      homeScore: [null],
      awayScore: [null],
    }),
    notes: [''],
  });
}
