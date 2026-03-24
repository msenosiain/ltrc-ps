import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { TrainingSession, TrainingSessionStatusEnum } from '@ltrc-campo/shared-api-model';

export interface SessionEditDialogData {
  session: TrainingSession;
}

export interface SessionEditDialogResult {
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
  ],
  template: `
    <h2 mat-dialog-title>Editar sesión</h2>
    <mat-dialog-content>
      <form [formGroup]="form" class="form">
        <div class="time-row">
          <mat-form-field>
            <mat-label>Inicio</mat-label>
            <input matInput formControlName="startTime" placeholder="HH:mm" />
          </mat-form-field>
          <mat-form-field>
            <mat-label>Fin</mat-label>
            <input matInput formControlName="endTime" placeholder="HH:mm" />
          </mat-form-field>
        </div>
        <mat-form-field class="full-width">
          <mat-label>Ubicación</mat-label>
          <input matInput formControlName="location" />
        </mat-form-field>
        <mat-form-field class="full-width">
          <mat-label>Estado</mat-label>
          <mat-select formControlName="status">
            <mat-option value="scheduled">Programado</mat-option>
            <mat-option value="completed">Completado</mat-option>
            <mat-option value="cancelled">Cancelado</mat-option>
          </mat-select>
        </mat-form-field>
        <mat-form-field class="full-width">
          <mat-label>Notas</mat-label>
          <textarea matInput formControlName="notes" rows="3"></textarea>
        </mat-form-field>
      </form>
    </mat-dialog-content>
    <mat-dialog-actions align="end">
      <button mat-button mat-dialog-close>Cancelar</button>
      <button mat-flat-button color="primary" [disabled]="form.invalid" (click)="save()">Guardar</button>
    </mat-dialog-actions>
  `,
  styles: [`
    .form { display: flex; flex-direction: column; gap: 4px; min-width: 320px; padding-top: 8px; }
    .time-row { display: flex; gap: 16px; }
    .time-row mat-form-field { flex: 1; }
    .full-width { width: 100%; }
  `],
})
export class SessionEditDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<SessionEditDialogComponent>);
  private readonly data: SessionEditDialogData = inject(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  readonly form = this.fb.group({
    startTime: [this.data.session.startTime, [Validators.required, Validators.pattern(/^\d{2}:\d{2}$/)]],
    endTime: [this.data.session.endTime, [Validators.required, Validators.pattern(/^\d{2}:\d{2}$/)]],
    location: [this.data.session.location ?? ''],
    status: [this.data.session.status ?? TrainingSessionStatusEnum.SCHEDULED, Validators.required],
    notes: [this.data.session.notes ?? ''],
  });

  save(): void {
    if (this.form.invalid) return;
    const v = this.form.value;
    const result: SessionEditDialogResult = {
      startTime: v.startTime!,
      endTime: v.endTime!,
      location: v.location || undefined,
      notes: v.notes || undefined,
      status: v.status as TrainingSessionStatusEnum,
    };
    this.dialogRef.close(result);
  }
}
