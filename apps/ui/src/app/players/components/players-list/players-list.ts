import { Component, inject, ViewChild } from '@angular/core';
import { PlayersService } from '../../services/players.service';
import { MatTableModule } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator.d';
import { MatSort } from '@angular/material/sort.d';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { PlayersDataSource } from '../../services/players.datasource';

@Component({
  selector: 'ltrc-players-list',
  imports: [MatTableModule, MatPaginator, MatSort, MatProgressBarModule],
  templateUrl: './players-list.html',
  styleUrl: './players-list.scss',
})
export class PlayersListComponent {
  private playersService = inject(PlayersService);

  displayedColumns = ['name', 'position'];
  dataSource = new PlayersDataSource(this.playersService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit(): void {
    this.loadPage();

    // Eventos
    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.loadPage();
    });

    this.paginator.page.subscribe(() => this.loadPage());
  }

  loadPage() {
    this.dataSource.load(
      this.paginator.pageIndex,
      this.paginator.pageSize || 10,
      this.sort.active,
      this.sort.direction as 'asc' | 'desc'
    );
  }
}
