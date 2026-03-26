import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { AsyncPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import {
  BehaviorSubject,
  finalize,
  Observable,
  asyncScheduler,
  observeOn,
  Subject,
  debounceTime,
  distinctUntilChanged,
  switchMap,
  of,
} from 'rxjs';
import {
  PaginatedResponse,
  PaginationQuery,
  Player,
  Workout,
  RoleEnum,
  SortOrder,
  SportEnum,
} from '@ltrc-campo/shared-api-model';
import { WorkoutsService } from '../../services/workouts.service';
import { PlayersService } from '../../../players/services/players.service';
import { getWorkoutStatusLabel, workoutStatusOptions, sportOptions } from '../../physical-training-options';
import { getCategoryLabel } from '../../../common/category-options';
import { getSportLabel } from '../../../common/sport-options';
import { AllowedRolesDirective } from '../../../auth/directives/allowed-roles.directive';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { CategoryOption, getCategoryOptionsBySport } from '../../../common/category-options';

class WorkoutsDataSource implements DataSource<Workout> {
  private itemsSubject = new BehaviorSubject<Workout[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  loading$ = this.loadingSubject.asObservable().pipe(observeOn(asyncScheduler));
  total = 0;

  private pageIndex = 0;
  private pageSize = 25;
  private filters: Record<string, unknown> = {};

  constructor(private service: WorkoutsService) {}

  connect(_: CollectionViewer): Observable<Workout[]> {
    return this.itemsSubject.asObservable();
  }

  disconnect(): void {
    this.itemsSubject.complete();
    this.loadingSubject.complete();
  }

  setPage(pageIndex: number, pageSize: number): void {
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.load();
  }

  setFilters(filters: Record<string, unknown>): void {
    this.filters = filters;
    this.pageIndex = 0;
    this.load();
  }

  load(): void {
    this.loadingSubject.next(true);
    const query: PaginationQuery = {
      page: this.pageIndex + 1,
      size: this.pageSize,
      sortBy: 'name',
      sortOrder: SortOrder.ASC,
      filters: this.filters,
    };
    this.service
      .getWorkouts(query)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (res: any) => {
          this.total = res.total;
          this.itemsSubject.next(res.items);
        },
        error: () => this.itemsSubject.next([]),
      });
  }
}

@Component({
  selector: 'ltrc-workout-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatIconModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatAutocompleteModule,
    AsyncPipe,
    FormsModule,
    AllowedRolesDirective,
  ],
  templateUrl: './workout-list.component.html',
  styleUrl: './workout-list.component.scss',
})
export class WorkoutListComponent implements AfterViewInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly routinesService = inject(WorkoutsService);
  private readonly playersService = inject(PlayersService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly destroyRef = inject(DestroyRef);

  readonly RoleEnum = RoleEnum;
  readonly displayedColumns = ['name', 'sport', 'category', 'validity', 'status', 'players'];
  readonly dataSource = new WorkoutsDataSource(this.routinesService);
  readonly sportOptions = sportOptions;
  readonly statusOptions = workoutStatusOptions;

  categoryOptions: CategoryOption[] = getCategoryOptionsBySport();

  selectedSport = '';
  selectedCategory = '';
  selectedStatus = '';
  playerSearch = '';
  selectedPlayerId = '';
  filteredPlayers: Player[] = [];

  private playerSearch$ = new Subject<string>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit(): void {
    this.dataSource.load();
    this.cdr.detectChanges();

    this.paginator.page.subscribe(() => {
      this.dataSource.setPage(this.paginator.pageIndex, this.paginator.pageSize);
    });

    this.playerSearch$
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        switchMap((term) =>
          term
            ? this.playersService.getPlayers({ page: 1, size: 20, filters: { searchTerm: term }, sortBy: 'name', sortOrder: SortOrder.ASC })
            : of({ items: [] as Player[], total: 0, page: 1, size: 20 } as PaginatedResponse<Player>)
        ),
        takeUntilDestroyed(this.destroyRef)
      )
      .subscribe((res) => (this.filteredPlayers = res.items));
  }

  ngOnDestroy(): void {}

  getStatusLabel(status: string): string {
    return getWorkoutStatusLabel(status);
  }

  getSportLabel(sport?: string): string {
    return getSportLabel(sport as any);
  }

  getCategoryLabel(category?: string): string {
    return getCategoryLabel(category as any);
  }

  onSportChange(): void {
    this.selectedCategory = '';
    this.categoryOptions = getCategoryOptionsBySport(this.selectedSport as SportEnum || undefined);
    this.applyFilters();
  }

  onPlayerInput(term: string): void {
    if (!term) {
      this.selectedPlayerId = '';
    }
    this.playerSearch$.next(term);
  }

  onPlayerSelected(player: Player): void {
    this.selectedPlayerId = player.id ?? '';
    this.playerSearch = player.name;
    this.applyFilters();
  }

  displayPlayer(player: Player): string {
    return player ? player.name : '';
  }

  clearPlayerFilter(): void {
    this.selectedPlayerId = '';
    this.playerSearch = '';
    this.filteredPlayers = [];
    this.applyFilters();
  }

  applyFilters(): void {
    const filters: Record<string, unknown> = {};
    if (this.selectedSport) filters['sport'] = this.selectedSport;
    if (this.selectedCategory) filters['category'] = this.selectedCategory;
    if (this.selectedStatus) filters['status'] = this.selectedStatus;
    if (this.selectedPlayerId) filters['playerId'] = this.selectedPlayerId;
    if (this.paginator) this.paginator.pageIndex = 0;
    this.dataSource.setFilters(filters);
  }

  viewDetails(id: string): void {
    this.router.navigate(['/dashboard/physical/workouts', id]);
  }

  createWorkout(): void {
    this.router.navigate(['/dashboard/physical/workouts/new']);
  }

  goToExercises(): void {
    this.router.navigate(['/dashboard/physical/exercises']);
  }
}
