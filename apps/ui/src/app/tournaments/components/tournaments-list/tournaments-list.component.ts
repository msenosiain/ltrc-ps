import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Router } from '@angular/router';
import { TournamentsService } from '../../services/tournaments.service';
import { Tournament } from '@ltrc-ps/shared-api-model';
import { TournamentSearchComponent } from '../tournament-search/tournament-search.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ltrc-tournaments-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    TournamentSearchComponent,
  ],
  templateUrl: './tournaments-list.component.html',
  styleUrl: './tournaments-list.component.scss',
})
export class TournamentsListComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly tournamentsService = inject(TournamentsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly displayedColumns = ['name', 'season', 'description'];

  private allTournaments: Tournament[] = [];
  tournaments: Tournament[] = [];
  loading = false;

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading = true;
    this.tournamentsService
      .getTournaments()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.allTournaments = this.sortBySeason(data);
          this.tournaments = this.allTournaments;
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
  }

  applyFilters(filters: { searchTerm?: string }): void {
    const term = filters.searchTerm?.toLowerCase().trim();
    const filtered = term
      ? this.allTournaments.filter(
          (t) =>
            t.name.toLowerCase().includes(term) ||
            t.season?.toLowerCase().includes(term) ||
            t.description?.toLowerCase().includes(term)
        )
      : this.allTournaments;

    this.tournaments = filtered;
  }

  private sortBySeason(tournaments: Tournament[]): Tournament[] {
    return [...tournaments].sort((a, b) => {
      if (!a.season && !b.season) return 0;
      if (!a.season) return 1;
      if (!b.season) return -1;
      return b.season.localeCompare(a.season);
    });
  }

  goToCreate(): void {
    this.router.navigate(['/dashboard/tournaments/create']);
  }

  viewTournamentDetails(tournamentId: string): void {
    this.router.navigate(['/dashboard/tournaments', tournamentId]);
  }
}