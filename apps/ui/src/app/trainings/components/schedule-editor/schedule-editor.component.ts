import {
  Component,
  HostListener,
  inject,
  OnInit,
  DestroyRef,
  signal,
} from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { TrainingSchedule } from '@ltrc-campo/shared-api-model';
import { TrainingSchedulesService } from '../../services/training-schedules.service';
import { ScheduleFormValue } from '../../forms/schedule-form.types';
import { ScheduleFormComponent } from '../schedule-form/schedule-form.component';
import { FormSkeletonComponent } from '../../../common/components/form-skeleton/form-skeleton.component';
import { ConfirmDialogComponent } from '../../../common/components/confirm-dialog/confirm-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getErrorMessage } from '../../../common/utils/error-message';

@Component({
  selector: 'ltrc-schedule-editor',
  standalone: true,
  imports: [
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    ScheduleFormComponent,
    FormSkeletonComponent,
  ],
  templateUrl: './schedule-editor.component.html',
  styleUrl: './schedule-editor.component.scss',
})
export class ScheduleEditorComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly schedulesService = inject(TrainingSchedulesService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  schedule?: TrainingSchedule;
  editing = false;
  submitting = false;
  loading = signal(false);
  clearCategory = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.editing = !!id;
    this.clearCategory = this.route.snapshot.queryParamMap.get('newDuplicate') === '1';

    if (id) {
      this.loading.set(true);
      this.schedulesService
        .getScheduleById(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ next: (schedule) => { this.schedule = schedule; this.loading.set(false); }, error: () => { this.loading.set(false); } });
    }
  }

  onFormSubmit(payload: ScheduleFormValue): void {
    this.submitting = true;

    const onError = (err: unknown) => {
      this.submitting = false;
      this.snackBar.open(
        getErrorMessage(err, 'Error al guardar el horario'),
        'Cerrar',
        { duration: 5000 }
      );
    };

    if (this.editing && this.schedule?.id) {
      this.schedulesService
        .updateSchedule(this.schedule.id, payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.submitting = false;
            this.router.navigate(['/dashboard/trainings/schedules']);
          },
          error: onError,
        });
      return;
    }

    this.schedulesService
      .createSchedule(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/dashboard/trainings/schedules']);
        },
        error: onError,
      });
  }

  onDelete(): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: {
        title: 'Eliminar horario',
        message: '¿Estás seguro que querés eliminar este horario? Esta acción no se puede deshacer.',
        confirmLabel: 'Eliminar',
      },
    });

    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.schedulesService
          .deleteSchedule(this.schedule!.id!)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() =>
            this.router.navigate(['/dashboard/trainings/schedules'])
          );
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
