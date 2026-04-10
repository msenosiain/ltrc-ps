import { Component, DestroyRef, inject, OnInit, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Workout, WorkoutLog, WorkoutLogBlock, WorkoutLogSetEntry } from '@ltrc-campo/shared-api-model';
import { WorkoutLogsService } from '../../services/workout-logs.service';
import { getErrorMessage } from '../../../common/utils/error-message';

@Component({
  selector: 'ltrc-my-workout',
  standalone: true,
  imports: [
    FormsModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule,
    MatProgressBarModule,
    MatInputModule,
    MatFormFieldModule,
    MatCheckboxModule,
  ],
  templateUrl: './my-workout.component.html',
  styleUrl: './my-workout.component.scss',
})
export class MyWorkoutComponent implements OnInit {
  private readonly workoutLogsService = inject(WorkoutLogsService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  todayWorkout: Workout | null = null;
  activeLog: WorkoutLog | null = null;
  loading = signal(true);
  saving = false;
  noWorkout = false;

  ngOnInit(): void {
    this.workoutLogsService
      .getTodayWorkout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (routine) => {
          this.todayWorkout = routine;
          this.loading.set(false);
          if (!routine) this.noWorkout = true;
        },
        error: () => {
          this.loading.set(false);
          this.noWorkout = true;
        },
      });
  }

  startWorkout(): void {
    if (!this.todayWorkout?.id) return;
    this.saving = true;
    this.workoutLogsService
      .createLog({ routineId: this.todayWorkout.id })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (log) => { this.activeLog = log; this.saving = false; },
        error: (err) => {
          this.saving = false;
          this.snackBar.open(getErrorMessage(err, 'Error al iniciar el entrenamiento'), 'Cerrar', { duration: 5000 });
        },
      });
  }

  getSortedBlocks(): WorkoutLogBlock[] {
    return [...(this.activeLog?.blocks ?? [])].sort((a, b) => a.blockOrder - b.blockOrder);
  }

  toggleSet(set: WorkoutLogSetEntry): void {
    set.completed = !set.completed;
  }

  saveLog(): void {
    if (!this.activeLog?.id) return;
    this.saving = true;
    const allDone = this.activeLog.blocks
      .flatMap((b) => b.exercises)
      .flatMap((e) => e.sets)
      .every((s) => s.completed);

    this.workoutLogsService
      .updateLog(this.activeLog.id as string, {
        blocks: this.activeLog.blocks,
        status: allDone ? 'completed' : 'in_progress',
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (updated) => {
          this.activeLog = updated;
          this.saving = false;
          this.snackBar.open(
            updated.status === 'completed' ? '¡Entrenamiento completado!' : 'Guardado',
            'Cerrar',
            { duration: 3000 }
          );
        },
        error: (err) => {
          this.saving = false;
          this.snackBar.open(getErrorMessage(err, 'Error al guardar'), 'Cerrar', { duration: 5000 });
        },
      });
  }

  onBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
