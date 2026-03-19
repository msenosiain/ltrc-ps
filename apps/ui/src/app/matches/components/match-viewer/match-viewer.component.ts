import {
  Component,
  HostListener,
  inject,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatchesService } from '../../services/matches.service';
import {
  AttendanceEntry,
  AttendanceStatusEnum,
  CategoryEnum,
  Match,
  MatchStatusEnum,
  RoleEnum,
  SportEnum,
  SquadEntry,
  Tournament,
  isCompetitiveCategory,
} from '@ltrc-campo/shared-api-model';
import { AllowedRolesDirective } from '../../../auth/directives/allowed-roles.directive';
import { getCategoryLabel as getCatLabel } from '../../match-options';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { PlayersService } from '../../../players/services/players.service';

@Component({
  selector: 'ltrc-match-viewer',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    DatePipe,
    AllowedRolesDirective,
  ],
  templateUrl: './match-viewer.component.html',
  styleUrl: './match-viewer.component.scss',
})
export class MatchViewerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly matchesService = inject(MatchesService);
  private readonly playersService = inject(PlayersService);
  private readonly destroyRef = inject(DestroyRef);

  match?: Match;
  isCompetitive = false;
  readonly MatchStatusEnum = MatchStatusEnum;
  readonly AttendanceStatusEnum = AttendanceStatusEnum;
  readonly RoleEnum = RoleEnum;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/dashboard/matches']);
      return;
    }

    this.matchesService
      .getMatchById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (match) => {
          this.match = match;
          const tournament = match.tournament as Tournament | undefined;
          if (match.category && tournament?.sport) {
            this.isCompetitive = isCompetitiveCategory(
              match.category,
              tournament.sport
            );
          }
        },
        error: () => this.router.navigate(['/dashboard/matches']),
      });
  }

  get tournament(): Tournament | undefined {
    return this.match?.tournament as Tournament | undefined;
  }

  get tournamentName(): string | undefined {
    return this.tournament?.name;
  }

  get tournamentHasAttachments(): boolean {
    return !!(this.tournament?.attachments?.length);
  }

  get sportLabel(): string {
    const sport = this.tournament?.sport;
    if (sport === SportEnum.RUGBY) return 'Rugby';
    if (sport === SportEnum.HOCKEY) return 'Hockey';
    return '';
  }

  goToTournament(): void {
    const id = this.tournament?.id;
    if (id) {
      this.router.navigate(['/dashboard/tournaments', id]);
    }
  }

  get titulares(): SquadEntry[] {
    return (this.match?.squad ?? [])
      .filter((e) => e.shirtNumber <= 15)
      .sort((a, b) => a.shirtNumber - b.shirtNumber);
  }

  get suplentes(): SquadEntry[] {
    return (this.match?.squad ?? [])
      .filter((e) => e.shirtNumber > 15)
      .sort((a, b) => a.shirtNumber - b.shirtNumber);
  }

  get playerAttendance(): AttendanceEntry[] {
    return (this.match?.attendance ?? []).filter((a) => !a.isStaff);
  }

  get staffAttendance(): AttendanceEntry[] {
    return (this.match?.attendance ?? []).filter((a) => a.isStaff);
  }

  getAttendanceStatusLabel(status?: AttendanceStatusEnum): string {
    if (status === AttendanceStatusEnum.PRESENT) return 'Presente';
    if (status === AttendanceStatusEnum.ABSENT) return 'Ausente';
    if (status === AttendanceStatusEnum.JUSTIFIED) return 'Justificado';
    return '—';
  }

  getStatusLabel(status: MatchStatusEnum): string {
    return this.matchesService.getStatusLabel(status);
  }

  getCategoryLabel(category?: CategoryEnum): string {
    return getCatLabel(category);
  }

  getPositionLabel(entry: SquadEntry): string {
    return entry.player?.positions?.length
      ? entry.player.positions.map((p) => this.playersService.getPositionLabel(p)).join(', ')
      : '—';
  }

  manageSquad(): void {
    this.router.navigate(['/dashboard/matches', this.match!.id, 'squad']);
  }

  manageAttendance(): void {
    this.router.navigate(['/dashboard/matches', this.match!.id, 'attendance']);
  }

  edit(): void {
    this.router.navigate(['/dashboard/matches', this.match!.id, 'edit']);
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.backToList();
  }

  backToList(): void {
    this.router.navigate(['/dashboard/matches']);
  }
}
