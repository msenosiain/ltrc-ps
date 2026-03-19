import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import {
  asyncScheduler,
  BehaviorSubject,
  finalize,
  Observable,
  observeOn,
} from 'rxjs';
import {
  PaginationQuery,
  SortOrder,
  TrainingSchedule,
} from '@ltrc-campo/shared-api-model';
import { ScheduleFilters } from '../forms/schedule-form.types';
import { TrainingSchedulesService } from './training-schedules.service';

export class SchedulesDataSource implements DataSource<TrainingSchedule> {
  private schedulesSubject = new BehaviorSubject<TrainingSchedule[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  loading$ = this.loadingSubject.asObservable().pipe(observeOn(asyncScheduler));
  total = 0;

  private filters: ScheduleFilters = {};
  private pageIndex = 0;
  private pageSize = 10;
  private sortBy?: string;
  private sortOrder?: SortOrder;

  constructor(private schedulesService: TrainingSchedulesService) {}

  connect(_: CollectionViewer): Observable<TrainingSchedule[]> {
    return this.schedulesSubject.asObservable();
  }

  disconnect(): void {
    this.schedulesSubject.complete();
    this.loadingSubject.complete();
  }

  configure(
    pageIndex: number,
    pageSize: number,
    sortBy?: string,
    sortOrder?: SortOrder
  ): void {
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
  }

  setFilters(filters: ScheduleFilters): void {
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

  private load(): void {
    this.loadingSubject.next(true);

    const query: PaginationQuery = {
      page: this.pageIndex + 1,
      size: this.pageSize,
      filters: this.filters,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
    };

    this.schedulesService
      .getSchedules(query)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (res) => {
          this.total = res.total;
          this.schedulesSubject.next(res.items);
        },
        error: () => this.schedulesSubject.next([]),
      });
  }
}
