import {
  Component,
  DestroyRef,
  HostListener,
  inject,
  OnInit,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Trip } from '@ltrc-campo/shared-api-model';
import { TripsService, CreateTripPayload } from '../../services/trips.service';
import { TripFormComponent } from '../trip-form/trip-form.component';
import { ConfirmDialogComponent } from '../../../common/components/confirm-dialog/confirm-dialog.component';
import { getErrorMessage } from '../../../common/utils/error-message';

@Component({
  selector: 'ltrc-trip-editor',
  standalone: true,
  imports: [
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    TripFormComponent,
  ],
  templateUrl: './trip-editor.component.html',
  styleUrl: './trip-editor.component.scss',
})
export class TripEditorComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly tripsService = inject(TripsService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  trip?: Trip;
  editing = false;
  submitting = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.editing = !!id;

    if (id) {
      this.tripsService
        .getTripById(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((trip) => (this.trip = trip));
    }
  }

  onFormSubmit(payload: CreateTripPayload): void {
    this.submitting = true;
    const onError = (err: unknown) => {
      this.submitting = false;
      this.snackBar.open(
        getErrorMessage(err, 'Error al guardar el viaje'),
        'Cerrar',
        { duration: 5000 }
      );
    };

    if (this.editing && this.trip?.id) {
      this.tripsService
        .updateTrip(this.trip.id, payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.submitting = false;
            this.router.navigate(['/dashboard/trips', this.trip!.id]);
          },
          error: onError,
        });
    } else {
      this.tripsService
        .createTrip(payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: (created) => {
            this.submitting = false;
            this.router.navigate(['/dashboard/trips', created.id]);
          },
          error: onError,
        });
    }
  }

  onDelete(): void {
    this.dialog
      .open(ConfirmDialogComponent, {
        width: '380px',
        data: {
          title: 'Eliminar viaje',
          message: `¿Eliminar "${this.trip?.name}"? Esta acción no se puede deshacer.`,
          confirmLabel: 'Eliminar',
        },
      })
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.tripsService
          .deleteTrip(this.trip!.id!)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.router.navigate(['/dashboard/trips']));
      });
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.dialog.openDialogs.length > 0) return;
    this.onCancel();
  }

  onCancel(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
