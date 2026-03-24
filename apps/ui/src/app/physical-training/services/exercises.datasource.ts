import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import {
  asyncScheduler,
  BehaviorSubject,
  finalize,
  Observable,
  observeOn,
} from 'rxjs';
import { Exercise, PaginationQuery, SortOrder } from '@ltrc-campo/shared-api-model';
import { ExercisesService } from './exercises.service';

export class ExercisesDataSource implements DataSource<Exercise> {
  private itemsSubject = new BehaviorSubject<Exercise[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  loading$ = this.loadingSubject.asObservable().pipe(observeOn(asyncScheduler));
  total = 0;

  private filters: Record<string, unknown> = {};
  private pageIndex = 0;
  private pageSize = 10;
  private sortBy?: string;
  private sortOrder?: SortOrder;

  constructor(private exercisesService: ExercisesService) {}

  connect(_: CollectionViewer): Observable<Exercise[]> {
    return this.itemsSubject.asObservable();
  }

  disconnect(): void {
    this.itemsSubject.complete();
    this.loadingSubject.complete();
  }

  configure(
    pageIndex: number,
    pageSize: number,
    sortBy?: string,
    sortOrder?: SortOrder,
  ): void {
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
  }

  setFilters(filters: Record<string, unknown>): void {
    this.filters = filters;
    this.pageIndex = 0;
    this.load();
  }

  setSorting(sortBy: string, sortOrder: SortOrder): void {
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    this.load();
  }

  setPage(pageIndex: number, pageSize: number): void {
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.load();
  }

  load(): void {
    this.loadingSubject.next(true);

    const query: PaginationQuery = {
      page: this.pageIndex + 1,
      size: this.pageSize,
      filters: this.filters,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
    };

    this.exercisesService
      .getExercises(query)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (res) => {
          this.total = res.total;
          this.itemsSubject.next(res.items);
        },
        error: () => this.itemsSubject.next([]),
      });
  }
}
