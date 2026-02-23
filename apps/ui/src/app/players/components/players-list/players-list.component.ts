import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { PlayersService } from '../../services/players.service';
import { PlayersDataSource } from '../../services/players.datasource';
import { PlayerPositionEnum } from '@ltrc-ps/shared-api-model';
import { CommonModule } from '@angular/common';
import { PlayerSearchComponent } from '../player-search/player-search.component';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule } from '@angular/material/dialog';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'ltrc-players-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    PlayerSearchComponent,
  ],
  templateUrl: './players-list.component.html',
  styleUrls: ['./players-list.component.scss'],
})
export class PlayersListComponent implements AfterViewInit {
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private playersService = inject(PlayersService);

  displayedColumns = [
    'photoId',
    'firstName',
    'lastName',
    'nickName',
    'position',
    'alternatePosition',
  ];
  dataSource = new PlayersDataSource(this.playersService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit(): void {
    // Cargar primera página
    this.dataSource.setPage(0, 10);

    // Suscripción al sort
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.dataSource.setSorting(
        this.sort.active,
        this.sort.direction as 'asc' | 'desc'
      );
    });

    // Suscripción a la paginación
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
  }) {
    this.paginator.pageIndex = 0;
    this.dataSource.setFilters(filters);
  }

  goToCreate() {
    this.router.navigate(['create'], { relativeTo: this.route });
  }

  viewPlayerDetails(playerId: string) {
    this.router.navigate(['/players', playerId]);
  }

  getPositionLabel(position: PlayerPositionEnum): string {
    return this.playersService.getPositionLabel(position);
  }

  getPlayerPhotoUrl(playerId: string) {
    return this.playersService.getPlayerPhotoUrl(playerId);
  }
}
