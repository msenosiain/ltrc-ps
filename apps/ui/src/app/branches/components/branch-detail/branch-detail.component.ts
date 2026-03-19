import { Component, HostListener, inject, OnInit } from '@angular/core';
import { AsyncPipe } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog } from '@angular/material/dialog';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {
  BehaviorSubject,
  debounceTime,
  distinctUntilChanged,
  finalize,
  forkJoin,
  switchMap,
} from 'rxjs';
import {
  BranchAssignment,
  CategoryEnum,
  HockeyBranchEnum,
  PaginationQuery,
  Player,
  SportEnum,
} from '@ltrc-campo/shared-api-model';
import { BranchAssignmentsService } from '../../services/branch-assignments.service';
import { PlayersService } from '../../../players/services/players.service';
import { getCategoryLabel } from '../../../common/category-options';
import { getBranchLabel } from '../../../common/branch-options';
import { ConfirmDialogComponent } from '../../../common/components/confirm-dialog/confirm-dialog.component';

@Component({
  selector: 'ltrc-branch-detail',
  standalone: true,
  imports: [
    AsyncPipe,
    ReactiveFormsModule,
    MatTableModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSnackBarModule,
    MatAutocompleteModule,
  ],
  templateUrl: './branch-detail.component.html',
  styleUrl: './branch-detail.component.scss',
})
export class BranchDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly service = inject(BranchAssignmentsService);
  private readonly playersService = inject(PlayersService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly dialog = inject(MatDialog);

  season!: number;
  category!: CategoryEnum;
  branch!: HockeyBranchEnum;

  categoryLabel = '';
  branchLabel = '';

  assignments: BranchAssignment[] = [];
  displayedColumns = ['name', 'idNumber', 'birthDate', 'actions'];

  private loadingSubject = new BehaviorSubject<boolean>(false);
  loading$ = this.loadingSubject.asObservable();

  // IDs of all players assigned to ANY branch in this season+category
  private allAssignedIds = new Set<string>();

  // Player search for assignment
  searchControl = new FormControl('');
  searchResults: Player[] = [];
  searching = false;

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.backToList();
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe((params) => {
      this.season = Number(params['season']) || new Date().getFullYear();
      this.category = params['category'] as CategoryEnum;
      this.branch = params['branch'] as HockeyBranchEnum;
      this.categoryLabel = getCategoryLabel(this.category);
      this.branchLabel = getBranchLabel(this.branch);
      this.loadAssignments();
    });

    this.searchControl.valueChanges
      .pipe(
        debounceTime(400),
        distinctUntilChanged(),
        switchMap((term) => {
          if (!term || term.length < 2) {
            this.searchResults = [];
            return [];
          }
          this.searching = true;
          const query: PaginationQuery = {
            page: 1,
            size: 10,
            filters: {
              searchTerm: term,
              sport: SportEnum.HOCKEY,
              category: this.category,
            },
          };
          return this.playersService.getPlayers(query);
        })
      )
      .subscribe({
        next: (res) => {
          this.searching = false;
          if (Array.isArray(res)) {
            this.searchResults = [];
          } else {
            // Filter out players assigned to ANY branch this season+category
            this.searchResults = res.items.filter(
              (p) => !this.allAssignedIds.has(p.id!)
            );
          }
        },
        error: () => {
          this.searching = false;
          this.searchResults = [];
        },
      });
  }

  private loadAssignments(): void {
    this.loadingSubject.next(true);

    // Load this branch's assignments AND all assignments for the season+category
    // to know which players are already taken across all branches
    const thisBranch$ = this.service.findAll({
      season: this.season,
      category: this.category,
      branch: this.branch,
    });
    const allBranches$ = this.service.findAll({
      season: this.season,
      category: this.category,
    });

    forkJoin([thisBranch$, allBranches$])
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: ([branchAssignments, allAssignments]) => {
          this.assignments = branchAssignments;
          this.allAssignedIds = new Set(
            allAssignments.map((a) => (a.player as any)?.id ?? a.player)
          );
        },
        error: () => {
          this.assignments = [];
          this.allAssignedIds = new Set();
        },
      });
  }

  assignPlayer(player: Player): void {
    this.service
      .create(player.id!, this.branch, this.category, this.season)
      .subscribe({
        next: () => {
          this.snackBar.open(`${player.name} asignada`, 'Cerrar', {
            duration: 3000,
          });
          this.searchControl.setValue('');
          this.searchResults = [];
          this.loadAssignments();
        },
        error: (err) => {
          const msg =
            err?.error?.message ?? 'Error al asignar jugadora';
          this.snackBar.open(msg, 'Cerrar', { duration: 5000 });
        },
      });
  }

  removeAssignment(assignment: BranchAssignment): void {
    const playerName = (assignment.player as any)?.name ?? 'la jugadora';
    const ref = this.dialog.open(ConfirmDialogComponent, {
      data: {
        title: 'Quitar de la rama',
        message: `¿Quitar a ${playerName} de ${this.branchLabel}?`,
        confirmLabel: 'Quitar',
      },
    });
    ref.afterClosed().subscribe((confirmed) => {
      if (!confirmed) return;
      this.service.delete(assignment.id!).subscribe({
        next: () => {
          this.snackBar.open('Jugadora quitada de la rama', 'Cerrar', {
            duration: 3000,
          });
          this.loadAssignments();
        },
        error: () => {
          this.snackBar.open('Error al quitar jugadora', 'Cerrar', {
            duration: 5000,
          });
        },
      });
    });
  }

  getPlayerField(assignment: BranchAssignment, field: string): string {
    const player = assignment.player as any;
    if (!player) return '';
    if (field === 'birthDate' && player.birthDate) {
      return new Date(player.birthDate).toLocaleDateString('es-AR');
    }
    return player[field] ?? '';
  }

  displayPlayerName(player: Player | null): string {
    return player?.name ?? '';
  }

  backToList(): void {
    this.router.navigate(['/dashboard/branches']);
  }

  viewPlayer(assignment: BranchAssignment): void {
    const playerId = (assignment.player as any)?.id ?? assignment.player;
    this.router.navigate(['/dashboard/players', playerId]);
  }
}
