import { AfterViewInit, Component, inject, OnDestroy, ViewChild } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { Router } from '@angular/router';
import { TournamentsService } from '../../services/tournaments.service';
import {
  TournamentsDataSource,
  TournamentFilters,
} from '../../services/tournaments.datasource';
import {
  CategoryEnum,
  MatchTypeEnum,
  RoleEnum,
  SortOrder,
  SportEnum,
} from '@ltrc-campo/shared-api-model';
import { AllowedRolesDirective } from '../../../auth/directives/allowed-roles.directive';
import { sportOptions } from '../../../common/sport-options';
import { getCategoryLabel, sortCategoriesAsc } from '../../../common/category-options';
import { matchTypeOptions } from '../../tournament-options';
import { TournamentSearchComponent } from '../tournament-search/tournament-search.component';
import { ListStateService } from '../../../common/services/list-state.service';

@Component({
  selector: 'ltrc-tournaments-list',
  standalone: true,
  imports: [
    AsyncPipe,
    MatTableModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    MatSortModule,
    MatPaginatorModule,
    TournamentSearchComponent,
    AllowedRolesDirective,
  ],
  templateUrl: './tournaments-list.component.html',
  styleUrl: './tournaments-list.component.scss',
})
export class TournamentsListComponent implements AfterViewInit, OnDestroy {
  private static readonly STATE_KEY = 'tournaments';
  private readonly router = inject(Router);
  private readonly tournamentsService = inject(TournamentsService);
  private readonly listState = inject(ListStateService);

  readonly RoleEnum = RoleEnum;
  readonly displayedColumns = [
    'name',
    'season',
    'sport',
    'categories',
    'type',
    'description',
  ];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly dataSource = new TournamentsDataSource(this.tournamentsService);
  readonly savedState = this.listState.get(TournamentsListComponent.STATE_KEY);

  private currentFilters: TournamentFilters = this.savedState?.filters ?? {};

  constructor() {
    const s = this.savedState;
    this.dataSource.configure(s?.pageIndex ?? 0, s?.pageSize ?? 10, s?.sortBy, s?.sortOrder);
  }

  ngAfterViewInit(): void {
    const s = this.savedState;
    const pageIndex = s?.pageIndex ?? 0;
    const pageSize = s?.pageSize ?? 10;

    this.paginator.pageIndex = pageIndex;
    this.paginator.pageSize = pageSize;

    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.dataSource.setSorting(this.sort.active, (this.sort.direction as SortOrder) || SortOrder.DESC);
      this.saveState();
    });

    this.paginator.page.subscribe(() => {
      this.dataSource.setPage(this.paginator.pageIndex, this.paginator.pageSize);
      this.saveState();
    });

    this.dataSource.setFilters(this.currentFilters, pageIndex);
  }

  ngOnDestroy(): void {
    this.saveState();
  }

  applyFilters(filters: TournamentFilters): void {
    this.currentFilters = filters;
    if (this.paginator) this.paginator.pageIndex = 0;
    this.dataSource.setFilters(filters);
    this.saveState();
  }

  private saveState(): void {
    this.listState.save(TournamentsListComponent.STATE_KEY, {
      filters: this.currentFilters,
      pageIndex: this.paginator?.pageIndex ?? 0,
      pageSize: this.paginator?.pageSize ?? 10,
      sortBy: this.sort?.active,
      sortOrder: this.sort?.direction as SortOrder,
    });
  }

  getSportLabel(sport?: SportEnum): string {
    return sportOptions.find((s) => s.id === sport)?.label ?? '';
  }

  getTypeLabel(type?: MatchTypeEnum): string {
    return matchTypeOptions.find((o) => o.id === type)?.label ?? '';
  }

  getCategoriesLabel(categories?: CategoryEnum[]): string {
    if (!categories?.length) return '';
    return sortCategoriesAsc(categories).map((c) => getCategoryLabel(c)).join(', ');
  }

  goToCreate(): void {
    this.router.navigate(['/dashboard/tournaments/create']);
  }

  viewTournamentDetails(tournamentId: string): void {
    this.router.navigate(['/dashboard/tournaments', tournamentId]);
  }
}
