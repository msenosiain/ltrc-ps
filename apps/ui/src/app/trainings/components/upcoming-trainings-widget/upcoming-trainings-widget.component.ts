import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { RoleEnum, UpcomingTraining } from '@ltrc-campo/shared-api-model';
import { TrainingSessionsService } from '../../services/training-sessions.service';
import { getCategoryLabel } from '../../training-options';
import { getSportLabel } from '../../../common/sport-options';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AuthService } from '../../../auth/auth.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { getErrorMessage } from '../../../common/utils/error-message';

interface GroupedTrainings {
  date: string;
  dayLabel: string;
  trainings: UpcomingTraining[];
}

@Component({
  selector: 'ltrc-upcoming-trainings-widget',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
  ],
  templateUrl: './upcoming-trainings-widget.component.html',
  styleUrl: './upcoming-trainings-widget.component.scss',
})
export class UpcomingTrainingsWidgetComponent implements OnInit {
  private readonly sessionsService = inject(TrainingSessionsService);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  grouped: GroupedTrainings[] = [];
  loading = true;
  isStaff = false;
  canConfirm = false;
  canEdit = false;

  ngOnInit(): void {
    const fieldRoles = [RoleEnum.PLAYER, RoleEnum.COACH, RoleEnum.TRAINER, RoleEnum.MANAGER];

    this.authService.user$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((user) => {
        if (user) {
          const roles = (user.roles ?? []) as RoleEnum[];
          this.isStaff = roles.some((r) =>
            [RoleEnum.ADMIN, RoleEnum.MANAGER, RoleEnum.COACH, RoleEnum.TRAINER].includes(r)
          );
          this.canConfirm = roles.some((r) => fieldRoles.includes(r));
          this.canEdit = roles.some((r) => [RoleEnum.ADMIN, RoleEnum.MANAGER].includes(r));
        }
      });

    this.loadUpcoming();
  }

  private loadUpcoming(): void {
    this.loading = true;
    this.sessionsService
      .getUpcomingForCurrentUser(1)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (trainings) => {
          this.grouped = this.groupByDate(trainings);
          this.loading = false;
        },
        error: () => {
          this.grouped = [];
          this.loading = false;
        },
      });
  }

  private groupByDate(trainings: UpcomingTraining[]): GroupedTrainings[] {
    const map = new Map<string, UpcomingTraining[]>();
    for (const t of trainings) {
      const list = map.get(t.date) ?? [];
      list.push(t);
      map.set(t.date, list);
    }

    const dayNames = [
      'Domingo',
      'Lunes',
      'Martes',
      'Miércoles',
      'Jueves',
      'Viernes',
      'Sábado',
    ];

    return Array.from(map.entries()).map(([date, items]) => {
      const d = new Date(date + 'T12:00:00Z');
      const todayUTC = new Date();
      const todayStr = todayUTC.toISOString().slice(0, 10);
      const tomorrowDate = new Date(todayStr + 'T12:00:00Z');
      tomorrowDate.setUTCDate(tomorrowDate.getUTCDate() + 1);
      const tomorrowStr = tomorrowDate.toISOString().slice(0, 10);

      let dayLabel: string;
      if (date === todayStr) {
        dayLabel = 'Hoy';
      } else if (date === tomorrowStr) {
        dayLabel = 'Mañana';
      } else {
        dayLabel = dayNames[d.getUTCDay()];
      }

      return { date, dayLabel, trainings: items };
    });
  }

  toggleConfirm(training: UpcomingTraining): void {
    if (training.confirmed) {
      this.sessionsService
        .cancelConfirmation(training.sessionId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            training.confirmed = false;
            training.confirmations = Math.max(0, training.confirmations - 1);
          },
          error: (err) =>
            this.snackBar.open(
              getErrorMessage(err, 'Error al cancelar'),
              'Cerrar',
              { duration: 3000 }
            ),
        });
    } else {
      this.sessionsService
        .confirmAttendance(training.sessionId)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            training.confirmed = true;
            training.confirmations++;
          },
          error: (err) =>
            this.snackBar.open(
              getErrorMessage(err, 'Error al confirmar'),
              'Cerrar',
              { duration: 3000 }
            ),
        });
    }
  }

  editSession(training: UpcomingTraining): void {
    this.router.navigate(['/dashboard/trainings/sessions', training.sessionId]);
  }

  goToAttendance(training: UpcomingTraining): void {
    this.router.navigate([
      '/dashboard/trainings/sessions',
      training.sessionId,
      'attendance',
    ]);
  }

  goToSession(training: UpcomingTraining): void {
    this.router.navigate([
      '/dashboard/trainings/sessions',
      training.sessionId,
    ]);
  }

  getCategoryLabel(training: UpcomingTraining): string {
    return getCategoryLabel(training.category);
  }

  getSportLabel(training: UpcomingTraining): string {
    return getSportLabel(training.sport);
  }
}
