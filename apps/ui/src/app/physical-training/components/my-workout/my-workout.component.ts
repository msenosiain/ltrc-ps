import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ExerciseVideo, Workout, WorkoutLog, WorkoutLogBlock, WorkoutLogSetEntry } from '@ltrc-campo/shared-api-model';
import { ExerciseVideoDialogComponent } from '../exercise-video-dialog/exercise-video-dialog.component';
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
    MatDialogModule,
  ],
  templateUrl: './my-workout.component.html',
  styleUrl: './my-workout.component.scss',
})
export class MyWorkoutComponent implements OnInit {
  private readonly workoutLogsService = inject(WorkoutLogsService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  todayWorkout: Workout | null = null;
  activeLog: WorkoutLog | null = null;
  loading = true;
  saving = false;
  noWorkout = false;

  private exerciseVideosMap = new Map<string, { videos: ExerciseVideo[]; name: string }>();

  ngOnInit(): void {
    this.workoutLogsService
      .getTodayWorkout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (routine) => {
          this.todayWorkout = routine;
          this.loading = false;
          if (!routine) { this.noWorkout = true; return; }
          // Build map of exerciseId → videos from the populated workout
          for (const block of routine.blocks ?? []) {
            for (const entry of block.exercises ?? []) {
              const ex = entry.exercise as any;
              if (ex && typeof ex === 'object' && ex.id) {
                this.exerciseVideosMap.set(ex.id, { videos: ex.videos ?? [], name: ex.name ?? '' });
              }
            }
          }
        },
        error: () => {
          this.loading = false;
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

  hasVideos(exerciseId: string): boolean {
    return (this.exerciseVideosMap.get(exerciseId)?.videos.length ?? 0) > 0;
  }

  openVideos(exerciseId: string, exerciseName: string): void {
    const entry = this.exerciseVideosMap.get(exerciseId);
    const videos = entry?.videos ?? [];
    if (!videos.length) return;
    this.dialog.open(ExerciseVideoDialogComponent, {
      width: '600px',
      maxWidth: '95vw',
      data: { exerciseName, videos },
    });
  }

  onBack(): void {
    this.router.navigate(['/dashboard']);
  }
}
