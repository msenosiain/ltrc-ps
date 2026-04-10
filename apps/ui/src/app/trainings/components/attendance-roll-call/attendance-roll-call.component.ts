import {
  Component,
  HostListener,
  inject,
  OnInit,
  DestroyRef,
  signal,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatTooltipModule } from '@angular/material/tooltip';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AttendanceStatusEnum,
  BlockEnum,
  Player,
  PlayerAvailabilityEnum,
  PlayerStatusEnum,
  SortOrder,
  TrainingSession,
  getCategoryBlock,
  CategoryEnum,
} from '@ltrc-campo/shared-api-model';
import { TrainingSessionsService } from '../../services/training-sessions.service';
import { PlayersService } from '../../../players/services/players.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { forkJoin } from 'rxjs';
import { getErrorMessage } from '../../../common/utils/error-message';

interface AttendanceRow {
  playerId?: string;
  userId?: string;
  userName?: string;
  name: string;
  isStaff: boolean;
  confirmed: boolean;
  status: AttendanceStatusEnum | null;
  isTrial?: boolean;
  trialDaysLeft?: number;
}

@Component({
  selector: 'ltrc-attendance-roll-call',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatButtonToggleModule,
    MatProgressBarModule,
    MatExpansionModule,
    MatTooltipModule,
    DatePipe,
    FormsModule,
  ],
  templateUrl: './attendance-roll-call.component.html',
  styleUrl: './attendance-roll-call.component.scss',
})
export class AttendanceRollCallComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
  private readonly sessionsService = inject(TrainingSessionsService);
  private readonly playersService = inject(PlayersService);
  private readonly destroyRef = inject(DestroyRef);

  session?: TrainingSession;
  isInfantiles = false;
  showQrButton = false;
  staffRows: AttendanceRow[] = [];
  playerRows: AttendanceRow[] = [];
  injuredRows: AttendanceRow[] = [];
  saving = false;
  loading = signal(true);

  readonly AttendanceStatusEnum = AttendanceStatusEnum;

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
        next: (session) => {
          this.session = session;
          if (session.category) {
            const block = getCategoryBlock(session.category as CategoryEnum);
            this.isInfantiles = block === BlockEnum.INFANTILES;
            this.showQrButton = block !== BlockEnum.INFANTILES && block !== BlockEnum.CADETES;
          }
          forkJoin({
            players: this.playersService.getPlayers({
              page: 1,
              size: 200,
              filters: { sport: session.sport, category: session.category, availableForTraining: true } as any,
              sortBy: 'name',
              sortOrder: SortOrder.ASC,
            }),
            staff: this.sessionsService.getStaffForSession(id),
          })
            .pipe(takeUntilDestroyed(this.destroyRef))
            .subscribe({
              next: ({ players, staff }) => {
                this.buildRows(session, players.items, staff);
                this.loading.set(false);
              },
              error: () => {
                this.buildRows(session, [], []);
                this.loading.set(false);
              },
            });
        },
        error: () => this.router.navigate(['/dashboard/trainings/sessions']),
      });
  }

  private buildRows(session: TrainingSession, allPlayers: Player[], staffUsers: { id: string; name: string; roles: string[] }[] = []): void {
    const attendance = session.attendance ?? [];

    // Staff rows: merge staff list with existing attendance
    const attendanceByStaff = new Map(
      attendance.filter((a) => a.isStaff).map((a) => [a.user as string, a])
    );
    this.staffRows = staffUsers.map((u) => {
      const existing = attendanceByStaff.get(u.id);
      return {
        userId: u.id,
        userName: u.name,
        name: u.name,
        isStaff: true,
        confirmed: existing?.confirmed ?? false,
        status: (existing?.status as AttendanceStatusEnum) ?? null,
      };
    });
    // Add any staff in attendance not in the staff list
    for (const [uid, entry] of attendanceByStaff) {
      if (!this.staffRows.some((r) => r.userId === uid)) {
        this.staffRows.push({
          userId: uid,
          userName: entry.userName,
          name: entry.userName ?? '—',
          isStaff: true,
          confirmed: entry.confirmed,
          status: (entry.status as AttendanceStatusEnum) ?? null,
        });
      }
    }

    // Split available vs injured (API already excluded inactive + called_up/suspended/leave)
    const injured = allPlayers.filter(
      (p) => p.availability?.status === PlayerAvailabilityEnum.INJURED
    );
    const available = allPlayers.filter(
      (p) => p.availability?.status !== PlayerAvailabilityEnum.INJURED
    );

    // Player rows: merge players list with existing attendance
    const attendanceByPlayer = new Map(
      attendance
        .filter((a) => !a.isStaff && a.player)
        .map((a) => {
          const p = a.player as any;
          const pid = p?.id ?? p?._id ?? String(p);
          return [pid, a];
        })
    );

    const toRow = (player: Player): AttendanceRow => {
      const existing = attendanceByPlayer.get(player.id!);
      const isTrial = player.status === PlayerStatusEnum.TRIAL;
      const trialDaysLeft = isTrial && player.trialStartDate
        ? Math.ceil((new Date(player.trialStartDate as any).getTime() + 14 * 86400000 - Date.now()) / 86400000)
        : undefined;
      return {
        playerId: player.id!,
        name: (player as any).name ?? player.id!,
        isStaff: false,
        confirmed: existing?.confirmed ?? false,
        status: (existing?.status as AttendanceStatusEnum) ?? null,
        isTrial,
        trialDaysLeft,
      };
    };

    this.playerRows = available.map(toRow);
    this.injuredRows = injured.map(toRow);

    // Add any attendance entries for players not in any list
    const allKnownIds = new Set([
      ...this.playerRows.map((r) => r.playerId),
      ...this.injuredRows.map((r) => r.playerId),
    ]);
    for (const [pid, entry] of attendanceByPlayer) {
      if (!allKnownIds.has(pid)) {
        const p = entry.player as any;
        this.playerRows.push({
          playerId: pid,
          name: p?.name ?? pid,
          isStaff: false,
          confirmed: entry.confirmed,
          status: (entry.status as AttendanceStatusEnum) ?? null,
        });
      }
    }
  }

  getTrialClass(days: number): string {
    if (days <= 0) return 'trial-expired';
    if (days <= 3) return 'trial-expiring';
    return 'trial-ok';
  }

  setStatus(row: AttendanceRow, status: AttendanceStatusEnum): void {
    row.status = row.status === status ? null : status;
  }

  markAllPresent(): void {
    const allRows = [...this.playerRows, ...this.staffRows];
    const allPresent = allRows.every((r) => r.status === AttendanceStatusEnum.PRESENT);
    const newStatus = allPresent ? null : AttendanceStatusEnum.PRESENT;
    for (const row of allRows) row.status = newStatus;
  }

  save(): void {
    if (!this.session?.id) return;
    this.saving = true;

    const records = [
      ...this.staffRows.map((r) => ({
          userId: r.userId,
          userName: r.userName,
          isStaff: true,
          status: r.status,
          confirmed: r.confirmed,
        })),
      ...[...this.playerRows, ...this.injuredRows].map((r) => ({
          playerId: r.playerId,
          isStaff: false,
          status: r.status,
          confirmed: r.confirmed,
        })),
    ];

    this.sessionsService
      .recordAttendance(this.session.id!, records)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.saving = false;
          this.snackBar.open('Asistencia guardada', 'Cerrar', {
            duration: 3000,
          });
          this.router.navigate([
            '/dashboard/trainings/sessions',
            this.session!.id,
          ]);
        },
        error: (err) => {
          this.saving = false;
          this.snackBar.open(
            getErrorMessage(err, 'Error al guardar la asistencia'),
            'Cerrar',
            { duration: 5000 }
          );
        },
      });
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.dialog.openDialogs.length > 0) return;
    this.goBack();
  }

  openQr(): void {
    window.open(`/dashboard/trainings/sessions/${this.session!.id}/qr`, '_blank');
  }

  goBack(): void {
    this.router.navigate(['/dashboard/trainings/sessions', this.session?.id]);
  }
}
