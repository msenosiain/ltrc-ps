import { Component, DestroyRef, inject, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { DayOfWeekEnum, Workout } from '@ltrc-campo/shared-api-model';
import { WorkoutsService } from '../../services/workouts.service';
import { WidgetShellComponent } from '../../../common/components/widget-shell/widget-shell.component';

const DAY_LABELS: Record<DayOfWeekEnum, string> = {
  [DayOfWeekEnum.MONDAY]: 'Lun',
  [DayOfWeekEnum.TUESDAY]: 'Mar',
  [DayOfWeekEnum.WEDNESDAY]: 'Mié',
  [DayOfWeekEnum.THURSDAY]: 'Jue',
  [DayOfWeekEnum.FRIDAY]: 'Vie',
  [DayOfWeekEnum.SATURDAY]: 'Sáb',
  [DayOfWeekEnum.SUNDAY]: 'Dom',
};

@Component({
  selector: 'ltrc-my-workout-widget',
  standalone: true,
  imports: [MatIconModule, WidgetShellComponent],
  templateUrl: './my-workout-widget.component.html',
  styleUrl: './my-workout-widget.component.scss',
})
export class MyWorkoutWidgetComponent implements OnInit {
  private readonly workoutsService = inject(WorkoutsService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  workouts: Workout[] = [];
  loading = true;

  ngOnInit(): void {
    this.workoutsService
      .getMyWorkouts()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (list) => { this.workouts = list; this.loading = false; },
        error: () => { this.loading = false; },
      });
  }

  exerciseCount(workout: Workout): number {
    return (workout.blocks ?? []).reduce((sum, b) => sum + (b.exercises?.length ?? 0), 0);
  }

  daysLabel(workout: Workout): string {
    return (workout.daysOfWeek ?? []).map((d) => DAY_LABELS[d]).join(' · ');
  }

  goToWorkout(id: string): void {
    this.router.navigate(['/dashboard/physical/my-workout'], { queryParams: { id } });
  }
}
