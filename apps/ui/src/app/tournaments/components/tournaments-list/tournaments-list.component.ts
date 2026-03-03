import {
  Component,
  inject,
  OnInit,
  DestroyRef,
  ViewChild,
  AfterViewInit,
} from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { Router } from '@angular/router';
import { TournamentsService } from '../../services/tournaments.service';
import {
  CategoryEnum,
  SortOrder,
  SportEnum,
  Tournament,
} from '@ltrc-ps/shared-api-model';
import { sportOptions } from '../../../common/sport-options';
import { getCategoryLabel } from '../../../common/category-options';
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

  readonly displayedColumns = [
    'name',
    'season',
    'sport',
    'categories',
    'description',
  ];

  @ViewChild(MatSort) sort!: MatSort;

  tournaments: Tournament[] = [];
  loading = false;

  private searchTerm?: string;
  private sport?: SportEnum;
  private sortBy: string | undefined = 'season';
  private sortOrder: SortOrder | undefined = SortOrder.DESC;

  ngOnInit(): void {
    this.load();
  }

  ngAfterViewInit(): void {
    this.sort.sortChange.subscribe(() => {
      this.sortBy = this.sort.active || undefined;
      this.sortOrder = (this.sort.direction as SortOrder) || undefined;
      this.load();
    });
  }

  private load(): void {
    this.loading = true;
    this.tournamentsService
      .getTournaments(this.searchTerm, this.sport, this.sortBy, this.sortOrder)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => {
          this.tournaments = data;
          this.loading = false;
        },
        error: () => (this.loading = false),
      });
  }

  applyFilters(filters: { searchTerm?: string; sport?: SportEnum }): void {
    this.searchTerm = filters.searchTerm;
    this.sport = filters.sport;
    this.load();
  }

  getSportLabel(sport?: SportEnum): string {
    return sportOptions.find((s) => s.id === sport)?.label ?? '';
  }

  getCategoriesLabel(categories?: CategoryEnum[]): string {
    if (!categories?.length) return '';
    return categories.map((c) => getCategoryLabel(c)).join(', ');
  }

  goToCreate(): void {
    this.router.navigate(['/dashboard/tournaments/create']);
  }

  viewTournamentDetails(tournamentId: string): void {
    this.router.navigate(['/dashboard/tournaments', tournamentId]);
  }
}
