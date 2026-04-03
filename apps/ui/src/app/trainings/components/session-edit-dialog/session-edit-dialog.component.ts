import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { TrainingSession, TrainingSessionStatusEnum } from '@ltrc-campo/shared-api-model';
import { format } from 'date-fns';

export interface SessionEditDialogData {
  session: TrainingSession;
}

export interface SessionEditDialogResult {
  date: string;
  startTime: string;
  endTime: string;
  location?: string;
  notes?: string;
  status: TrainingSessionStatusEnum;
}

@Component({
  selector: 'ltrc-session-edit-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatDatepickerModule,
  ],
  templateUrl: './session-edit-dialog.component.html',
  styleUrl: './session-edit-dialog.component.scss',
})
export class SessionEditDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<SessionEditDialogComponent>);
  private readonly data: SessionEditDialogData = inject(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    date: [
      new Date((this.data.session.date as unknown as string) + 'T12:00:00Z'),
      Validators.required,
    ],
    startTime: [this.data.session.startTime, Validators.required],
    endTime: [this.data.session.endTime, Validators.required],
    location: [this.data.session.location ?? ''],
    status: [this.data.session.status ?? TrainingSessionStatusEnum.SCHEDULED, Validators.required],
    notes: [this.data.session.notes ?? ''],
  });

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.value;
    const result: SessionEditDialogResult = {
      date: format(v.date!, 'yyyy-MM-dd'),
      startTime: v.startTime!,
      endTime: v.endTime!,
      location: v.location || undefined,
      notes: v.notes || undefined,
      status: v.status as TrainingSessionStatusEnum,
    };
    this.dialogRef.close(result);
  }
}
