import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
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
import { AsyncPipe, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import {
  BehaviorSubject,
  finalize,
  Observable,
  asyncScheduler,
  observeOn,
} from 'rxjs';
import {
  PaginationQuery,
  Workout,
  RoleEnum,
  SortOrder,
  SportEnum,
} from '@ltrc-campo/shared-api-model';
import { WorkoutsService } from '../../services/workouts.service';
import { getWorkoutStatusLabel, workoutStatusOptions, sportOptions } from '../../physical-training-options';
import { getCategoryLabel } from '../../../common/category-options';
import { getSportLabel } from '../../../common/sport-options';
import { AllowedRolesDirective } from '../../../auth/directives/allowed-roles.directive';
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
    AsyncPipe,
    DatePipe,
    FormsModule,
    AllowedRolesDirective,
  ],
  templateUrl: './workout-list.component.html',
  styleUrl: './workout-list.component.scss',
})
export class WorkoutListComponent implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly routinesService = inject(WorkoutsService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly RoleEnum = RoleEnum;
  readonly displayedColumns = ['name', 'sport', 'category', 'validity', 'status'];
  readonly dataSource = new WorkoutsDataSource(this.routinesService);
  readonly sportOptions = sportOptions;
  readonly statusOptions = workoutStatusOptions;

  categoryOptions: CategoryOption[] = getCategoryOptionsBySport();

  selectedSport = '';
  selectedCategory = '';
  selectedStatus = '';

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  ngAfterViewInit(): void {
    this.dataSource.load();
    this.cdr.detectChanges();

    this.paginator.page.subscribe(() => {
      this.dataSource.setPage(this.paginator.pageIndex, this.paginator.pageSize);
    });
  }

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

  applyFilters(): void {
    const filters: Record<string, unknown> = {};
    if (this.selectedSport) filters['sport'] = this.selectedSport;
    if (this.selectedCategory) filters['category'] = this.selectedCategory;
    if (this.selectedStatus) filters['status'] = this.selectedStatus;
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
