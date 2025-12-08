import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PlayersService } from '../../services/players.service';
import { PlayersDataSource } from '../../services/players.datasource';
import { PlayerFilters } from '@ltrc-ps/shared-api-model';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'ltrc-players-list',
  imports: [
    CommonModule,
    MatTableModule,
    MatPaginator,
    MatSort,
    MatProgressBarModule,
  ],
  templateUrl: './players-list.component.html',
  styleUrl: './players-list.component.scss',
})
export class PlayersListComponent implements AfterViewInit {
  private playersService = inject(PlayersService);

  displayedColumns = [
    'photoId',
    'firstName',
    'lastName',
    'nickName',
    'position',
  ];

  dataSource = new PlayersDataSource(this.playersService);

  // Filtros actuales
  filters: PlayerFilters = {};

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit(): void {
    this.loadPage();

    // Evento de sort
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.loadPage();
    });

    // Evento de paginación
    this.paginator.page.subscribe(() => this.loadPage());
  }

  loadPage() {
    this.dataSource.load(
      this.paginator.pageIndex ?? 0,
      this.paginator.pageSize ?? 10,
      this.filters,
      this.sort.active,
      this.sort.direction as 'asc' | 'desc'
    );
  }

  applyFilters(f: PlayerFilters) {
    this.filters = f;
    this.paginator.pageIndex = 0;
    this.loadPage();
  }

  getPlayerPhotoUrl(playerId: string): string {
    return `http://localhost:3000/api/players/${playerId}/photo`;
  }
}
