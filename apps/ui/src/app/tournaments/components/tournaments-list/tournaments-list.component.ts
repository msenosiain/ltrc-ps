import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
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
  RoleEnum,
  SortOrder,
  SportEnum,
} from '@ltrc-ps/shared-api-model';
import { AllowedRolesDirective } from '../../../auth/directives/allowed-roles.directive';
import { sportOptions } from '../../../common/sport-options';
import { getCategoryLabel } from '../../../common/category-options';
import { TournamentSearchComponent } from '../tournament-search/tournament-search.component';

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
export class TournamentsListComponent implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly tournamentsService = inject(TournamentsService);

  readonly RoleEnum = RoleEnum;
  readonly displayedColumns = [
    'name',
    'season',
    'sport',
    'categories',
    'description',
  ];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly dataSource = new TournamentsDataSource(this.tournamentsService);

  ngAfterViewInit(): void {
    this.dataSource.load();

    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.dataSource.setSorting(
        this.sort.active,
        (this.sort.direction as SortOrder) || SortOrder.DESC
      );
    });

    this.paginator.page.subscribe(() => {
      this.dataSource.setPage(
        this.paginator.pageIndex,
        this.paginator.pageSize
      );
    });
  }

  applyFilters(filters: TournamentFilters): void {
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.dataSource.setFilters(filters);
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
