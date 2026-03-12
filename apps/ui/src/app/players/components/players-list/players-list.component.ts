import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { PlayersService } from '../../services/players.service';
import { PlayersDataSource } from '../../services/players.datasource';
import {
  ImportResultDialogComponent,
  ImportResultDialogData,
} from '../../../common/components/import-result-dialog/import-result-dialog.component';
import {
  CategoryEnum,
  HockeyBranchEnum,
  PlayerPosition,
  RoleEnum,
  SortOrder,
  SportEnum,
} from '@ltrc-ps/shared-api-model';
import { AllowedRolesDirective } from '../../../auth/directives/allowed-roles.directive';
import { categoryOptions } from '../../../common/category-options';
import { PlayerSearchComponent } from '../player-search/player-search.component';
import { Router } from '@angular/router';

@Component({
  selector: 'ltrc-players-list',
  standalone: true,
  imports: [
    AsyncPipe,
    MatTableModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatSnackBarModule,
    PlayerSearchComponent,
    AllowedRolesDirective,
  ],
  templateUrl: './players-list.component.html',
  styleUrls: ['./players-list.component.scss'],
})
export class PlayersListComponent implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly playersService = inject(PlayersService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  importing = false;
  readonly RoleEnum = RoleEnum;

  private readonly baseColumns = ['photoId', 'name', 'nickName', 'category'];
  private readonly afterCategoryColumns = ['position', 'alternatePosition'];
  displayedColumns = [...this.baseColumns, ...this.afterCategoryColumns];

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
    sport?: SportEnum;
    position?: PlayerPosition;
    category?: CategoryEnum;
  }): void {
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.updateColumns(filters.sport);
    this.dataSource.setFilters(filters);
  }

  private updateColumns(sport?: SportEnum): void {
    if (sport === SportEnum.HOCKEY) {
      this.displayedColumns = [
        ...this.baseColumns,
        'branch',
        ...this.afterCategoryColumns,
      ];
    } else {
      this.displayedColumns = [
        ...this.baseColumns,
        ...this.afterCategoryColumns,
      ];
    }
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

  getPositionLabel(position: PlayerPosition, sport?: SportEnum | null): string {
    return this.playersService.getPositionLabel(position, sport);
  }

  getPlayerPhotoUrl(playerId: string): string {
    return this.playersService.getPlayerPhotoUrl(playerId);
  }

  onSurveyFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';

    this.importing = true;
    this.playersService.updateFromSurvey(file).subscribe({
      next: ({ updated, notFound, errors }) => {
        this.importing = false;
        if (notFound.length > 0 || errors.length > 0) {
          this.dialog.open(ImportResultDialogComponent, {
            width: '500px',
            data: {
              title: 'Resultado de encuesta',
              successCount: updated,
              successLabel: 'actualizados',
              notFound,
              errors,
            } satisfies ImportResultDialogData,
          });
        } else {
          this.snackBar.open(`${updated} actualizados`, 'Cerrar', {
            duration: 5000,
          });
        }
        this.dataSource.setPage(0, this.paginator.pageSize);
        this.paginator.pageIndex = 0;
      },
      error: () => {
        this.importing = false;
        this.snackBar.open('Error al procesar la encuesta', 'Cerrar', {
          duration: 5000,
        });
      },
    });
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
        if (errors.length > 0) {
          this.dialog.open(ImportResultDialogComponent, {
            width: '500px',
            data: {
              title: 'Resultado de importación',
              successCount: created,
              successLabel: 'importados',
              errors,
            } satisfies ImportResultDialogData,
          });
        } else {
          this.snackBar.open(`${created} jugadores importados`, 'Cerrar', {
            duration: 5000,
          });
        }
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
