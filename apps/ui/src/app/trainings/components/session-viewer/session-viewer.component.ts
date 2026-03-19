import {
  Component,
  HostListener,
  inject,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import {
  AttendanceEntry,
  RoleEnum,
  TrainingSession,
  TrainingSessionStatusEnum,
} from '@ltrc-campo/shared-api-model';
import { TrainingSessionsService } from '../../services/training-sessions.service';
import {
  getAttendanceStatusLabel,
  getCategoryLabel,
  getSessionStatusLabel,
} from '../../training-options';
import { getSportLabel } from '../../../common/sport-options';
import { AllowedRolesDirective } from '../../../auth/directives/allowed-roles.directive';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ltrc-session-viewer',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    DatePipe,
    AllowedRolesDirective,
  ],
  templateUrl: './session-viewer.component.html',
  styleUrl: './session-viewer.component.scss',
})
export class SessionViewerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sessionsService = inject(TrainingSessionsService);
  private readonly destroyRef = inject(DestroyRef);

  session?: TrainingSession;
  readonly RoleEnum = RoleEnum;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/dashboard/trainings/sessions']);
      return;
    }

    this.sessionsService
      .getSessionById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (session) => (this.session = session),
        error: () => this.router.navigate(['/dashboard/trainings/sessions']),
      });
  }

  getSportLabel(): string {
    return getSportLabel(this.session?.sport);
  }

  getCategoryLabel(): string {
    return getCategoryLabel(this.session?.category);
  }

  getStatusLabel(): string {
    return getSessionStatusLabel(this.session?.status);
  }

  getAttendanceStatusLabel(entry: AttendanceEntry): string {
    return getAttendanceStatusLabel(entry.status);
  }

  get playerAttendance(): AttendanceEntry[] {
    return (this.session?.attendance ?? []).filter((a) => !a.isStaff);
  }

  get staffAttendance(): AttendanceEntry[] {
    return (this.session?.attendance ?? []).filter((a) => a.isStaff);
  }

  get confirmedCount(): number {
    return (this.session?.attendance ?? []).filter((a) => a.confirmed).length;
  }

  get presentCount(): number {
    return (this.session?.attendance ?? []).filter(
      (a) => a.status === 'present'
    ).length;
  }

  getPlayerName(entry: AttendanceEntry): string {
    if (entry.isStaff) return entry.userName ?? '—';
    const player = entry.player as any;
    if (!player) return '—';
    return player.name ?? `${player.lastName}, ${player.firstName}`;
  }

  goToAttendance(): void {
    this.router.navigate([
      '/dashboard/trainings/sessions',
      this.session!.id,
      'attendance',
    ]);
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.backToList();
  }

  backToList(): void {
    this.router.navigate(['/dashboard/trainings/sessions']);
  }
}
