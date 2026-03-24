import {
  Component,
  HostListener,
  inject,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonToggleModule } from '@angular/material/button-toggle';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  AttendanceStatusEnum,
  Player,
  PlayerAvailabilityEnum,
  PlayerStatusEnum,
  SortOrder,
  TrainingSession,
} from '@ltrc-campo/shared-api-model';
import { TrainingSessionsService } from '../../services/training-sessions.service';
import { PlayersService } from '../../../players/services/players.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getErrorMessage } from '../../../common/utils/error-message';

interface AttendanceRow {
  playerId?: string;
  userId?: string;
  userName?: string;
  name: string;
  isStaff: boolean;
  confirmed: boolean;
  status: AttendanceStatusEnum | null;
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
  staffRows: AttendanceRow[] = [];
  playerRows: AttendanceRow[] = [];
  injuredRows: AttendanceRow[] = [];
  saving = false;
  loading = true;

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
          this.loadPlayersForSession(session);
          this.loadStaffForSession(id);
        },
        error: () => this.router.navigate(['/dashboard/trainings/sessions']),
      });
  }

  private loadStaffForSession(sessionId: string): void {
    this.sessionsService
      .getStaffForSession(sessionId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (staffUsers) => {
          const existingIds = new Set(this.staffRows.map((r) => r.userId));
          for (const u of staffUsers) {
            if (!existingIds.has(u.id)) {
              this.staffRows.push({
                userId: u.id,
                userName: u.name,
                name: u.name,
                isStaff: true,
                confirmed: false,
                status: null,
              });
            }
          }
        },
      });
  }

  private loadPlayersForSession(session: TrainingSession): void {
    // Load all players for this sport/category
    this.playersService
      .getPlayers({
        page: 1,
        size: 200,
        filters: {
          sport: session.sport,
          category: session.category,
          availableForTraining: true,
        } as any,
        sortBy: 'name',
        sortOrder: SortOrder.ASC,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.buildRows(session, res.items);
          this.loading = false;
        },
        error: () => {
          this.buildRows(session, []);
          this.loading = false;
        },
      });
  }

  private buildRows(session: TrainingSession, allPlayers: Player[]): void {
    const attendance = session.attendance ?? [];

    // Staff rows from existing attendance
    this.staffRows = attendance
      .filter((a) => a.isStaff)
      .map((a) => ({
        userId: a.user as string,
        userName: a.userName,
        name: a.userName ?? '—',
        isStaff: true,
        confirmed: a.confirmed,
        status: (a.status as AttendanceStatusEnum) ?? null,
      }));

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
      return {
        playerId: player.id!,
        name: (player as any).name ?? player.id!,
        isStaff: false,
        confirmed: existing?.confirmed ?? false,
        status: (existing?.status as AttendanceStatusEnum) ?? null,
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

  setStatus(row: AttendanceRow, status: AttendanceStatusEnum): void {
    row.status = row.status === status ? null : status;
  }

  markAllPresent(): void {
    for (const row of this.playerRows) {
      row.status = AttendanceStatusEnum.PRESENT;
    }
    for (const row of this.staffRows) {
      row.status = AttendanceStatusEnum.PRESENT;
    }
  }

  save(): void {
    if (!this.session?.id) return;
    this.saving = true;

    const records = [
      ...this.staffRows
        .filter((r) => r.status || r.confirmed !== undefined)
        .map((r) => ({
          userId: r.userId,
          userName: r.userName,
          isStaff: true,
          ...(r.status ? { status: r.status } : {}),
          confirmed: r.confirmed,
        })),
      ...[...this.playerRows, ...this.injuredRows]
        .filter((r) => r.status || r.confirmed !== undefined)
        .map((r) => ({
          playerId: r.playerId,
          isStaff: false,
          ...(r.status ? { status: r.status } : {}),
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

  goBack(): void {
    this.router.navigate(['/dashboard/trainings/sessions', this.session?.id]);
  }
}
