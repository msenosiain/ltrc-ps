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
  CategoryEnum,
  Match,
  MatchStatusEnum,
  MatchTypeEnum,
  RoleEnum,
  SquadEntry,
  Tournament,
} from '@ltrc-ps/shared-api-model';
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
  readonly MatchStatusEnum = MatchStatusEnum;
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
        next: (match) => (this.match = match),
        error: () => this.router.navigate(['/dashboard/matches']),
      });
  }

  get tournamentName(): string | undefined {
    return (this.match?.tournament as Tournament)?.name;
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

  getStatusLabel(status: MatchStatusEnum): string {
    return this.matchesService.getStatusLabel(status);
  }

  getTypeLabel(type: MatchTypeEnum): string {
    return this.matchesService.getTypeLabel(type);
  }

  getCategoryLabel(category?: CategoryEnum): string {
    return getCatLabel(category);
  }

  getPositionLabel(entry: SquadEntry): string {
    return entry.player?.position
      ? this.playersService.getPositionLabel(entry.player.position)
      : '—';
  }

  manageSquad(): void {
    this.router.navigate(['/dashboard/matches', this.match!.id, 'squad']);
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
