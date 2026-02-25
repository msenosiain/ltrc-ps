import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { PlayersService } from '../../services/players.service';
import { PlayersDataSource } from '../../services/players.datasource';
import { PlayerPositionEnum } from '@ltrc-ps/shared-api-model';
import { PlayerSearchComponent } from '../player-search/player-search.component';
import { Router } from '@angular/router';

@Component({
  selector: 'ltrc-players-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    PlayerSearchComponent,
  ],
  templateUrl: './players-list.component.html',
  styleUrls: ['./players-list.component.scss'],
})
export class PlayersListComponent implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly playersService = inject(PlayersService);

  readonly displayedColumns = [
    'photoId',
    'firstName',
    'lastName',
    'nickName',
    'position',
    'alternatePosition',
  ];

  readonly dataSource = new PlayersDataSource(this.playersService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit(): void {
    this.dataSource.setPage(0, 10);

    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.dataSource.setSorting(
        this.sort.active,
        this.sort.direction as 'asc' | 'desc'
      );
    });

    this.paginator.page.subscribe(() => {
      this.dataSource.setPage(
        this.paginator.pageIndex,
        this.paginator.pageSize
      );
    });
  }

  applyFilters(filters: {
    searchTerm?: string;
    position?: PlayerPositionEnum;
  }): void {
    this.paginator.pageIndex = 0;
    this.dataSource.setFilters(filters);
  }

  goToCreate(): void {
    this.router.navigate(['/dashboard/players/create']);
  }

  viewPlayerDetails(playerId: string): void {
    this.router.navigate(['/dashboard/players', playerId]);
  }

  getPositionLabel(position: PlayerPositionEnum): string {
    return this.playersService.getPositionLabel(position);
  }

  getPlayerPhotoUrl(playerId: string): string {
    return this.playersService.getPlayerPhotoUrl(playerId);
  }
}
