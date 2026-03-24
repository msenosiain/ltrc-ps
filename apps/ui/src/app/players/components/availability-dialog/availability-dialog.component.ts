import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatDatepickerModule } from '@angular/material/datepicker';
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

  private toDateInput(d?: Date | string | null): string {
    if (!d) return '';
    const date = new Date(d);
    return isNaN(date.getTime()) ? '' : date.toISOString().slice(0, 10);
  }

  private readonly avail: PlayerAvailability | undefined = this.data.player.availability;

  readonly form = this.fb.group({
    status: [this.avail?.status ?? PlayerAvailabilityEnum.AVAILABLE],
    reason: [this.avail?.reason ?? ''],
    since: [this.toDateInput(this.avail?.since)],
    estimatedReturn: [this.toDateInput(this.avail?.estimatedReturn)],
  });

  get showDetails(): boolean {
    return this.form.get('status')!.value !== PlayerAvailabilityEnum.AVAILABLE;
  }

  save(): void {
    const v = this.form.value;
    const result: AvailabilityDialogResult = {
      status: v.status as PlayerAvailabilityEnum,
      reason: v.reason || undefined,
      since: v.since || undefined,
      estimatedReturn: v.estimatedReturn || undefined,
    };
    this.dialogRef.close(result);
  }
}
