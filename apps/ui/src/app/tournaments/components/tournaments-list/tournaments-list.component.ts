import { Component, inject, OnInit, DestroyRef, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSort, MatSortModule } from '@angular/material/sort';
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
    MatSortModule,
    TournamentSearchComponent,
  ],
  templateUrl: './tournaments-list.component.html',
  styleUrl: './tournaments-list.component.scss',
})
export class TournamentsListComponent implements OnInit, AfterViewInit {
  private readonly router = inject(Router);
  private readonly tournamentsService = inject(TournamentsService);
  private readonly destroyRef = inject(DestroyRef);

  readonly displayedColumns = ['name', 'season', 'description'];

  @ViewChild(MatSort) sort!: MatSort;

  tournaments: Tournament[] = [];
  loading = false;

  private searchTerm?: string;
  private sortBy: string | undefined = 'season';
  private sortOrder: 'asc' | 'desc' | undefined = 'desc';

  ngOnInit(): void {
    this.load();
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      this.sortBy = this.sort.active || undefined;
      this.sortOrder = (this.sort.direction as 'asc' | 'desc') || undefined;
      this.load();
    });
  }

  private load(): void {
    this.loading = true;
    this.tournamentsService
      .getTournaments(this.searchTerm, this.sortBy, this.sortOrder)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.tournaments = data;
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
  }

  applyFilters(filters: { searchTerm?: string }): void {
    this.searchTerm = filters.searchTerm;
    this.load();
  }

  goToCreate(): void {
    this.router.navigate(['/dashboard/tournaments/create']);
  }

  viewTournamentDetails(tournamentId: string): void {
    this.router.navigate(['/dashboard/tournaments', tournamentId]);
  }
}