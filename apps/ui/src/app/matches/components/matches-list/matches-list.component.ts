import { AfterViewInit, ChangeDetectorRef, Component, inject, ViewChild } from '@angular/core';
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
import { Match, MatchStatusEnum, MatchTypeEnum } from '@ltrc-ps/shared-api-model';

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
  ],
  templateUrl: './matches-list.component.html',
  styleUrl: './matches-list.component.scss',
})
export class MatchesListComponent implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly matchesService = inject(MatchesService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly displayedColumns = ['date', 'opponent', 'type', 'status', 'result'];
  readonly dataSource = new MatchesDataSource(this.matchesService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit(): void {
    this.dataSource.setPage(0, 10);
    this.cdr.detectChanges();

    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.dataSource.setSorting(
        this.sort.active,
        this.sort.direction as 'asc' | 'desc'
      );
    });

    this.paginator.page.subscribe(() => {
      this.dataSource.setPage(this.paginator.pageIndex, this.paginator.pageSize);
    });
  }

  applyFilters(filters: MatchFilters): void {
    this.paginator.pageIndex = 0;
    this.dataSource.setFilters(filters);
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