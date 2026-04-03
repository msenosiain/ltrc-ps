import { Component, inject } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatDialogModule, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Match } from '@ltrc-campo/shared-api-model';

export interface SetResultDialogData {
  match: Match;
}

export interface SetResultDialogResult {
  homeScore: number;
  awayScore: number;
}

@Component({
  selector: 'ltrc-set-result-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
  ],
  templateUrl: './set-result-dialog.component.html',
  styleUrl: './set-result-dialog.component.scss',
})
export class SetResultDialogComponent {
  readonly dialogRef = inject(MatDialogRef<SetResultDialogComponent>);
  readonly data: SetResultDialogData = inject(MAT_DIALOG_DATA);

  readonly form = new FormGroup({
    homeScore: new FormControl<number | null>(
      this.data.match.result?.homeScore ?? null,
      [Validators.required, Validators.min(0)]
    ),
    awayScore: new FormControl<number | null>(
      this.data.match.result?.awayScore ?? null,
      [Validators.required, Validators.min(0)]
    ),
  });

  save(): void {
    if (this.form.invalid) return;
    this.dialogRef.close({
      homeScore: this.form.value.homeScore!,
      awayScore: this.form.value.awayScore!,
    } as SetResultDialogResult);
  }
}
