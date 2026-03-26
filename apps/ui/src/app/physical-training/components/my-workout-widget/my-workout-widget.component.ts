import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { Workout } from '@ltrc-campo/shared-api-model';
import { WorkoutLogsService } from '../../services/workout-logs.service';

@Component({
  selector: 'ltrc-my-workout-widget',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressBarModule],
  templateUrl: './my-workout-widget.component.html',
  styleUrl: './my-workout-widget.component.scss',
})
export class MyWorkoutWidgetComponent implements OnInit {
  private readonly workoutLogsService = inject(WorkoutLogsService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  workout: Workout | null = null;
  loading = true;

  ngOnInit(): void {
    this.workoutLogsService
      .getTodayWorkout()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (w) => { this.workout = w; this.loading = false; },
        error: () => { this.loading = false; },
      });
  }

  get exerciseCount(): number {
    return (this.workout?.blocks ?? []).reduce(
      (sum, b) => sum + (b.exercises?.length ?? 0),
      0
    );
  }

  goToWorkout(): void {
    this.router.navigate(['/dashboard/physical/my-workout']);
  }
}