import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { PlayersService } from '../../services/players.service';
import { PlayersDataSource } from '../../services/players.datasource';
import { CategoryEnum, PlayerPosition, SortOrder } from '@ltrc-ps/shared-api-model';
import { categoryOptions } from '../../category-options';
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
    MatSnackBarModule,
    PlayerSearchComponent,
  ],
  templateUrl: './players-list.component.html',
  styleUrls: ['./players-list.component.scss'],
})
export class PlayersListComponent implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly playersService = inject(PlayersService);
  private readonly snackBar = inject(MatSnackBar);

  importing = false;

  readonly displayedColumns = [
    'photoId',
    'firstName',
    'lastName',
    'nickName',
    'category',
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
        this.sort.direction as SortOrder
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
    position?: PlayerPosition;
    category?: CategoryEnum;
  }): void {
    this.paginator.pageIndex = 0;
    this.dataSource.setFilters(filters);
  }

  getCategoryLabel(category?: CategoryEnum): string {
    if (!category) return '';
    return categoryOptions.find((c) => c.id === category)?.label ?? category;
  }

  goToCreate(): void {
    this.router.navigate(['/dashboard/players/create']);
  }

  viewPlayerDetails(playerId: string): void {
    this.router.navigate(['/dashboard/players', playerId]);
  }

  getPositionLabel(position: PlayerPosition): string {
    return this.playersService.getPositionLabel(position);
  }

  getPlayerPhotoUrl(playerId: string): string {
    return this.playersService.getPlayerPhotoUrl(playerId);
  }

  onImportFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';

    this.importing = true;
    this.playersService.importPlayers(file).subscribe({
      next: ({ created, errors }) => {
        this.importing = false;
        const msg =
          errors.length > 0
            ? `${created} importados, ${errors.length} errores`
            : `${created} jugadores importados`;
        this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
        this.dataSource.setPage(0, this.paginator.pageSize);
        this.paginator.pageIndex = 0;
      },
      error: () => {
        this.importing = false;
        this.snackBar.open('Error al importar el archivo', 'Cerrar', {
          duration: 5000,
        });
      },
    });
  }
}
