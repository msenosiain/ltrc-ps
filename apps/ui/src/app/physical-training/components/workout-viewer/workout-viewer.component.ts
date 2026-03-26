import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CategoryEnum, Exercise, RoleEnum, SportEnum, Workout, WorkoutBlock } from '@ltrc-campo/shared-api-model';
import { getCategoryLabel } from '../../../common/category-options';
import { getSportLabel } from '../../../common/sport-options';
import { WorkoutsService } from '../../services/workouts.service';
import { getWorkoutStatusLabel } from '../../physical-training-options';
import { AllowedRolesDirective } from '../../../auth/directives/allowed-roles.directive';
import { ConfirmDialogComponent } from '../../../common/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'ltrc-workout-viewer',
  standalone: true,
  imports: [
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatProgressBarModule,
    MatCardModule,
    AllowedRolesDirective,
  ],
  templateUrl: './workout-viewer.component.html',
  styleUrl: './workout-viewer.component.scss',
})
export class WorkoutViewerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly workoutsService = inject(WorkoutsService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  readonly RoleEnum = RoleEnum;

  workout?: Workout;
  loading = true;
  cloning = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.workoutsService
      .getWorkoutById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (routine) => {
          this.workout = routine;
          this.loading = false;
        },
        error: () => {
          this.loading = false;
          this.router.navigate(['/dashboard/physical/workouts']);
        },
      });
  }

  getStatusLabel(status: string): string {
    return getWorkoutStatusLabel(status);
  }

  getSportLabel(sport?: string): string {
    return getSportLabel(sport as SportEnum);
  }

  getCategoryLabel(category?: string): string {
    return getCategoryLabel(category as CategoryEnum);
  }

  getSetsLabel(sets: any[]): string {
    if (!sets?.length) return '—';
    return sets.map((s, i) => {
      const parts = [s.reps, s.duration, s.load].filter(Boolean);
      return `${i + 1}. ${parts.join(' / ') || '—'}`;
    }).join('  ·  ');
  }

  getExerciseName(exercise: Exercise | string | null | undefined): string {
    if (!exercise) return '—';
    if (typeof exercise === 'string') return exercise;
    return (exercise as Exercise).name ?? '—';
  }

  getSortedExercises(block: WorkoutBlock) {
    return [...(block.exercises ?? [])].sort((a, b) => a.order - b.order);
  }

  getAssignedPlayers(): string[] {
    return (this.workout?.assignedPlayers ?? []).map((p) => {
      if (typeof p === 'string') return p;
      return (p as any).name ?? (p as any).id ?? '';
    });
  }

  getSortedBlocks(): WorkoutBlock[] {
    return [...(this.workout?.blocks ?? [])].sort((a, b) => a.order - b.order);
  }

  onEdit(): void {
    this.router.navigate(['/dashboard/physical/workouts', this.workout!.id, 'edit']);
  }

  onEditBlocks(): void {
    this.router.navigate(['/dashboard/physical/workouts', this.workout!.id, 'blocks']);
  }

  onDelete(): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: {
        title: 'Eliminar rutina',
        message: '¿Estás seguro que querés eliminar esta rutina? Esta acción no se puede deshacer.',
        confirmLabel: 'Eliminar',
      },
    });

    ref.afterClosed().pipe(takeUntilDestroyed(this.destroyRef)).subscribe((confirmed) => {
      if (!confirmed) return;
      this.workoutsService
        .deleteWorkout(this.workout!.id!)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.snackBar.open('Rutina eliminada', 'Cerrar', { duration: 3000 });
            this.router.navigate(['/dashboard/physical/workouts']);
          },
          error: () => {
            this.snackBar.open('Error al eliminar', 'Cerrar', { duration: 5000 });
          },
        });
    });
  }

  onClone(): void {
    if (!this.workout?.id) return;
    this.cloning = true;
    this.workoutsService
      .cloneWorkout(this.workout.id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (cloned) => {
          this.cloning = false;
          this.snackBar.open('Rutina duplicada', 'Cerrar', { duration: 3000 });
          this.router.navigate(['/dashboard/physical/workouts', cloned.id]);
        },
        error: () => {
          this.cloning = false;
          this.snackBar.open('Error al duplicar la rutina', 'Cerrar', { duration: 5000 });
        },
      });
  }

  onBack(): void {
    this.router.navigate(['/dashboard/physical/workouts']);
  }
}
