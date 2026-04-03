import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { format } from 'date-fns';
import { Player, PlayerAvailability, PlayerAvailabilityEnum } from '@ltrc-campo/shared-api-model';

export interface AvailabilityDialogData {
  player: Player;
}

export interface AvailabilityDialogResult {
  status: PlayerAvailabilityEnum;
  reason?: string;
  since?: string;
  estimatedReturn?: string;
}

@Component({
  selector: 'ltrc-availability-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
  ],
  templateUrl: './availability-dialog.component.html',
  styleUrl: './availability-dialog.component.scss',
})
export class AvailabilityDialogComponent {
  private readonly dialogRef = inject(MatDialogRef<AvailabilityDialogComponent>);
  readonly data: AvailabilityDialogData = inject(MAT_DIALOG_DATA);
  private readonly fb = inject(FormBuilder);

  readonly availabilityOptions = [
    { id: PlayerAvailabilityEnum.AVAILABLE, label: 'Disponible' },
    { id: PlayerAvailabilityEnum.INJURED, label: 'Lesionado' },
    { id: PlayerAvailabilityEnum.SUSPENDED, label: 'Suspendido' },
    { id: PlayerAvailabilityEnum.LEAVE, label: 'Con permiso' },
    { id: PlayerAvailabilityEnum.CALLED_UP, label: 'Convocado' },
  ];

  readonly PlayerAvailabilityEnum = PlayerAvailabilityEnum;

  private toDate(d?: Date | string | null): Date | null {
    if (!d) return null;
    const date = new Date(d);
    // Avoid timezone offset shifting the date
    return isNaN(date.getTime()) ? null : new Date(String(d).slice(0, 10) + 'T12:00:00');
  }

  private readonly avail: PlayerAvailability | undefined = this.data.player.availability;

  readonly form = this.fb.group({
    status: [this.avail?.status ?? PlayerAvailabilityEnum.AVAILABLE],
    reason: [this.avail?.reason ?? ''],
    since: [this.toDate(this.avail?.since)],
    estimatedReturn: [this.toDate(this.avail?.estimatedReturn)],
  });

  get showDetails(): boolean {
    return this.form.get('status')!.value !== PlayerAvailabilityEnum.AVAILABLE;
  }

  clearField(field: 'since' | 'estimatedReturn'): void {
    this.form.get(field)!.setValue(null);
  }

  save(): void {
    const v = this.form.value;
    const result: AvailabilityDialogResult = {
      status: v.status as PlayerAvailabilityEnum,
      reason: v.reason || undefined,
      since: v.since ? format(v.since as Date, 'yyyy-MM-dd') : undefined,
      estimatedReturn: v.estimatedReturn ? format(v.estimatedReturn as Date, 'yyyy-MM-dd') : undefined,
    };
    this.dialogRef.close(result);
  }
}
