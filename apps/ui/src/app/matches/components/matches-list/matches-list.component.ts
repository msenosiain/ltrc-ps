import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { AsyncPipe, DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatchesService } from '../../services/matches.service';
import { MatchesDataSource } from '../../services/matches.datasource';
import { MatchFilters } from '../../forms/match-form.types';
import { MatchSearchComponent } from '../match-search/match-search.component';
import {
  Match,
  MatchStatusEnum,
  MatchTypeEnum,
  RoleEnum,
  SortOrder,
} from '@ltrc-ps/shared-api-model';
import { AllowedRolesDirective } from '../../../auth/directives/allowed-roles.directive';
import { ListStateService } from '../../../common/services/list-state.service';

@Component({
  selector: 'ltrc-matches-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    AsyncPipe,
    DatePipe,
    MatchSearchComponent,
    AllowedRolesDirective,
  ],
  templateUrl: './matches-list.component.html',
  styleUrl: './matches-list.component.scss',
})
export class MatchesListComponent implements AfterViewInit, OnDestroy {
  private static readonly STATE_KEY = 'matches';
  private readonly router = inject(Router);
  private readonly matchesService = inject(MatchesService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly listState = inject(ListStateService);

  readonly RoleEnum = RoleEnum;
  readonly displayedColumns = [
    'date',
    'opponent',
    'venue',
    'division',
    'tournament',
    'status',
    'result',
  ];
  readonly dataSource = new MatchesDataSource(this.matchesService);
  readonly savedState = this.listState.get(MatchesListComponent.STATE_KEY);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private currentFilters: MatchFilters = this.savedState?.filters ?? {};

  ngAfterViewInit(): void {
    const s = this.savedState;
    const pageIndex = s?.pageIndex ?? 0;
    const pageSize = s?.pageSize ?? 10;
    const sortBy = s?.sortBy || 'date';
    const sortOrder = s?.sortOrder || SortOrder.ASC;

    this.paginator.pageIndex = pageIndex;
    this.paginator.pageSize = pageSize;
    this.sort.active = sortBy;
    this.sort.direction = sortOrder as '' | 'asc' | 'desc';

    this.dataSource.configure(pageIndex, pageSize, sortBy, sortOrder);
    this.cdr.detectChanges();

    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.dataSource.setSorting(
        this.sort.active,
        this.sort.direction as SortOrder
      );
      this.saveState();
    });

    this.paginator.page.subscribe(() => {
      this.dataSource.setPage(
        this.paginator.pageIndex,
        this.paginator.pageSize
      );
      this.saveState();
    });
  }

  ngOnDestroy(): void {
    this.saveState();
  }

  applyFilters(filters: MatchFilters): void {
    this.currentFilters = filters;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.dataSource.setFilters(filters);
    this.saveState();
  }

  private saveState(): void {
    this.listState.save(MatchesListComponent.STATE_KEY, {
      filters: this.currentFilters,
      pageIndex: this.paginator?.pageIndex ?? 0,
      pageSize: this.paginator?.pageSize ?? 10,
      sortBy: this.sort?.active,
      sortOrder: this.sort?.direction as SortOrder,
    });
  }

  goToCreate(): void {
    this.router.navigate(['/dashboard/matches/create']);
  }

  viewMatchDetails(matchId: string): void {
    this.router.navigate(['/dashboard/matches', matchId]);
  }

  getStatusLabel(status: MatchStatusEnum): string {
    return this.matchesService.getStatusLabel(status);
  }

  getTypeLabel(type: MatchTypeEnum): string {
    return this.matchesService.getTypeLabel(type);
  }

  getResultLabel(match: Match): string {
    if (!match.result) return '—';
    const home = match.isHome ? match.result.homeScore : match.result.awayScore;
    const away = match.isHome ? match.result.awayScore : match.result.homeScore;
    return `${home} - ${away}`;
  }

  isCompleted(status: MatchStatusEnum): boolean {
    return status === MatchStatusEnum.COMPLETED;
  }
}
