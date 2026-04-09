import { Component, inject, OnDestroy } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatTableModule } from '@angular/material/table';
import { MatTabsModule } from '@angular/material/tabs';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatSortModule, Sort } from '@angular/material/sort';
import { BehaviorSubject, finalize } from 'rxjs';
import {
  BranchAssignment,
  CategoryEnum,
  HockeyBranchEnum,
  RoleEnum,
  SportEnum,
} from '@ltrc-campo/shared-api-model';
import { BranchAssignmentsService } from '../../services/branch-assignments.service';
import {
  BranchSearchComponent,
  BranchSearchFilters,
} from '../branch-search/branch-search.component';
import {
  CategoryOption,
  getCategoryOptionsBySport,
} from '../../../common/category-options';
import { getBranchLabel } from '../../../common/branch-options';
import { getPositionLabel } from '../../../players/position-options';
import { AllowedRolesDirective } from '../../../auth/directives/allowed-roles.directive';
import {
  ImportResultDialogComponent,
  ImportResultDialogData,
} from '../../../common/components/import-result-dialog/import-result-dialog.component';
import { ListStateService } from '../../../common/services/list-state.service';

export interface BranchTab {
  label: string;
  branch: HockeyBranchEnum;
  category: CategoryEnum;
  assignments: BranchAssignment[];
}

const ALL_BRANCHES = Object.values(HockeyBranchEnum);

@Component({
  selector: 'ltrc-branch-list',
  standalone: true,
  imports: [
    AsyncPipe,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    MatTableModule,
    MatTabsModule,
    MatSnackBarModule,
    MatSortModule,
    BranchSearchComponent,
    AllowedRolesDirective,
  ],
  templateUrl: './branch-list.component.html',
  styleUrl: './branch-list.component.scss',
})
export class BranchListComponent implements OnDestroy {
  private static readonly STATE_KEY = 'branches';
  private readonly service = inject(BranchAssignmentsService);
  private readonly router = inject(Router);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);
  private readonly listState = inject(ListStateService);

  readonly savedState = this.listState.get(BranchListComponent.STATE_KEY);

  readonly RoleEnum = RoleEnum;
  readonly displayedColumns = [
    'name',
    'positions',
    'idNumber',
    'birthDate',
  ];
  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  importing = false;
  tabs: BranchTab[] = [];
  private currentSort: Sort = { active: '', direction: '' };
  private currentFilters: BranchSearchFilters = this.savedState?.filters ?? {
    season: new Date().getFullYear(),
  };

  private readonly hockeyCategories: CategoryOption[] =
    getCategoryOptionsBySport(SportEnum.HOCKEY);

  ngOnDestroy(): void {
    this.saveState();
  }

  onFiltersChange(filters: BranchSearchFilters): void {
    const needsReload =
      filters.season !== this.currentFilters.season ||
      filters.category !== this.currentFilters.category ||
      filters.branch !== this.currentFilters.branch;
    this.currentFilters = filters;
    if (needsReload) {
      this.load();
    }
    this.saveState();
  }

  private saveState(): void {
    this.listState.save(BranchListComponent.STATE_KEY, {
      filters: this.currentFilters,
      pageIndex: 0,
      pageSize: 0,
    });
  }

  getFilteredAssignments(tab: BranchTab): BranchAssignment[] {
    let result = tab.assignments;

    if (this.currentFilters.searchTerm) {
      const term = this.currentFilters.searchTerm.toLowerCase();
      result = result.filter((a) => {
        const player = a.player as any;
        if (!player) return false;
        const name = (player.name ?? '').toLowerCase();
        const nickName = (player.nickName ?? '').toLowerCase();
        return name.includes(term) || nickName.includes(term);
      });
    }

    if (this.currentFilters.position) {
      const pos = this.currentFilters.position;
      result = result.filter((a) => {
        const player = a.player as any;
        return player?.positions?.includes(pos);
      });
    }

    if (this.currentSort.active && this.currentSort.direction) {
      const { active, direction } = this.currentSort;
      const dir = direction === 'asc' ? 1 : -1;
      result = [...result].sort((a, b) => {
        const valA = this.getSortValue(a, active);
        const valB = this.getSortValue(b, active);
        return valA.localeCompare(valB) * dir;
      });
    }

    return result;
  }

  onSortChange(sort: Sort): void {
    this.currentSort = sort;
  }

  private getSortValue(assignment: BranchAssignment, column: string): string {
    const player = assignment.player as any;
    if (!player) return '';
    switch (column) {
      case 'name':
        return player.name ?? '';
      case 'positions':
        return (player.positions ?? []).map((p: any) => getPositionLabel(p, player.sport)).join(', ');
      case 'idNumber':
        return player.idNumber ?? '';
      case 'birthDate':
        return player.birthDate ?? '';
      default:
        return '';
    }
  }

  private load(): void {
    this.loadingSubject.next(true);
    this.service
      .findAll({
        season: this.currentFilters.season,
        category: this.currentFilters.category,
        branch: this.currentFilters.branch,
      })
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (assignments) => {
          this.tabs = this.buildTabs(assignments);
        },
        error: () => {
          this.tabs = this.buildTabs([]);
        },
      });
  }

  private buildTabs(assignments: BranchAssignment[]): BranchTab[] {
    const map = new Map<string, BranchAssignment[]>();
    for (const a of assignments) {
      const key = `${a.category}-${a.branch}`;
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(a);
    }

    const branchesPerCategory = new Map<string, Set<string>>();
    for (const a of assignments) {
      if (!branchesPerCategory.has(a.category))
        branchesPerCategory.set(a.category, new Set());
      branchesPerCategory.get(a.category)!.add(a.branch);
    }

    const categories = this.currentFilters.category
      ? this.hockeyCategories.filter(
          (c) => c.id === this.currentFilters.category
        )
      : this.hockeyCategories;

    const branches = this.currentFilters.branch
      ? ALL_BRANCHES.filter((b) => b === this.currentFilters.branch)
      : ALL_BRANCHES;

    const tabs: BranchTab[] = [];
    for (const cat of categories) {
      const usedBranches = branchesPerCategory.get(cat.id);
      const catHasAssignments = usedBranches && usedBranches.size > 0;

      for (const branch of branches) {
        if (catHasAssignments && !usedBranches!.has(branch)) continue;

        const key = `${cat.id}-${branch}`;
        const tabAssignments = map.get(key) ?? [];
        tabs.push({
          label: `${cat.label} ${branch}`,
          branch,
          category: cat.id,
          assignments: tabAssignments,
        });
      }
    }

    return tabs;
  }

  getPlayerField(assignment: BranchAssignment, field: string): string {
    const player = assignment.player as any;
    if (!player) return '';
    if (field === 'birthDate' && player.birthDate) {
      return new Date(player.birthDate).toLocaleDateString('es-AR');
    }
    return player[field] ?? '';
  }

  getPlayerPositions(assignment: BranchAssignment): string {
    const player = assignment.player as any;
    return (player?.positions ?? [])
      .map((p: any) => getPositionLabel(p, player?.sport))
      .join(', ');
  }

  viewPlayer(assignment: BranchAssignment): void {
    const playerId = (assignment.player as any)?.id ?? assignment.player;
    this.router.navigate(['/dashboard/players', playerId]);
  }

  navigateToDetail(tab: BranchTab): void {
    this.router.navigate(['/dashboard/branches/detail'], {
      queryParams: {
        season: this.currentFilters.season,
        category: tab.category,
        branch: tab.branch,
      },
    });
  }

  onImportFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    input.value = '';

    this.importing = true;
    this.service
      .importFromFile(file, this.currentFilters.season)
      .subscribe({
        next: ({ created, updated, errors }) => {
          this.importing = false;
          if (errors.length > 0) {
            this.dialog.open(ImportResultDialogComponent, {
              width: '500px',
              data: {
                title: 'Resultado de importación de ramas',
                successCount: created + updated,
                successLabel: `asignadas (${created} nuevas, ${updated} actualizadas)`,
                errors,
              } satisfies ImportResultDialogData,
            });
          } else {
            this.snackBar.open(
              `${created} nuevas, ${updated} actualizadas`,
              'Cerrar',
              { duration: 5000 }
            );
          }
          this.load();
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
