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
  TrainingSession,
  TrainingSessionFilters,
} from '@ltrc-campo/shared-api-model';
import { TrainingSessionsService } from './training-sessions.service';

export class SessionsDataSource implements DataSource<TrainingSession> {
  private sessionsSubject = new BehaviorSubject<TrainingSession[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  loading$ = this.loadingSubject.asObservable().pipe(observeOn(asyncScheduler));
  total = 0;

  private filters: TrainingSessionFilters = {};
  private pageIndex = 0;
  private pageSize = 25;
  private sortBy?: string;
  private sortOrder?: SortOrder;

  constructor(private sessionsService: TrainingSessionsService) {}

  connect(_: CollectionViewer): Observable<TrainingSession[]> {
    return this.sessionsSubject.asObservable();
  }

  disconnect(): void {
    this.sessionsSubject.complete();
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

  setFilters(filters: TrainingSessionFilters): void {
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

    this.sessionsService
      .getSessions(query)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (res) => {
          this.total = res.total;
          this.sessionsSubject.next(res.items);
        },
        error: () => this.sessionsSubject.next([]),
      });
  }
}
