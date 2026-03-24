import {
  Component,
  HostListener,
  inject,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { RoleEnum, TrainingSchedule } from '@ltrc-campo/shared-api-model';
import { TrainingSchedulesService } from '../../services/training-schedules.service';
import { getCategoryLabel, getDayLabel } from '../../training-options';
import { getSportLabel } from '../../../common/sport-options';
import { AllowedRolesDirective } from '../../../auth/directives/allowed-roles.directive';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ltrc-schedule-viewer',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    DatePipe,
    AllowedRolesDirective,
  ],
  templateUrl: './schedule-viewer.component.html',
  styleUrl: './schedule-viewer.component.scss',
})
export class ScheduleViewerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly schedulesService = inject(TrainingSchedulesService);
  private readonly destroyRef = inject(DestroyRef);

  schedule?: TrainingSchedule;
  readonly RoleEnum = RoleEnum;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/dashboard/trainings/schedules']);
      return;
    }

    this.schedulesService
      .getScheduleById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (schedule) => (this.schedule = schedule),
        error: () => this.router.navigate(['/dashboard/trainings/schedules']),
      });
  }

  getSportLabel(): string {
    return getSportLabel(this.schedule?.sport);
  }

  getCategoryLabel(): string {
    return getCategoryLabel(this.schedule?.category);
  }

  getDayLabel(day: string): string {
    return getDayLabel(day as any);
  }

  duplicate(): void {
    if (!this.schedule) return;
    this.schedulesService
      .duplicateSchedule(this.schedule.id!)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((copy) => {
        this.router.navigate(['/dashboard/trainings/schedules', copy.id, 'edit']);
      });
  }

  edit(): void {
    this.router.navigate([
      '/dashboard/trainings/schedules',
      this.schedule!.id,
      'edit',
    ]);
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.backToList();
  }

  backToList(): void {
    this.router.navigate(['/dashboard/trainings/schedules']);
  }
}
