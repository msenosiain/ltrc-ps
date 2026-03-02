import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatchStatusEnum } from '@ltrc-ps/shared-api-model';

export function buildCreateMatchForm(fb: FormBuilder): FormGroup {
  return fb.group({
    date: [null, Validators.required],
    opponent: ['', Validators.required],
    venue: ['', Validators.required],
    isHome: [true],
    type: [null, Validators.required],
    status: [MatchStatusEnum.UPCOMING],
    tournament: [null],
    result: fb.group({
      homeScore: [null],
      awayScore: [null],
    }),
    notes: [''],
  });
}