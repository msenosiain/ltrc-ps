import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import {
  asyncScheduler,
  BehaviorSubject,
  finalize,
  Observable,
  observeOn,
} from 'rxjs';
import { PaginationQuery, SortOrder, Trip, TripStatusEnum, SportEnum } from '@ltrc-campo/shared-api-model';
import { TripsService } from './trips.service';

export interface TripListFilters {
  searchTerm?: string;
  sport?: SportEnum;
  status?: TripStatusEnum;
}

export class TripsDataSource implements DataSource<Trip> {
  private tripsSubject = new BehaviorSubject<Trip[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  loading$ = this.loadingSubject.asObservable().pipe(observeOn(asyncScheduler));
  total = 0;

  private filters: TripListFilters = {};
  private pageIndex = 0;
  private pageSize = 25;
  private sortBy?: string;
  private sortOrder?: SortOrder;

  constructor(private readonly tripsService: TripsService) {}

  connect(_: CollectionViewer): Observable<Trip[]> {
    return this.tripsSubject.asObservable();
  }

  disconnect(): void {
    this.tripsSubject.complete();
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

  setFilters(filters: TripListFilters): void {
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
    this.tripsService
      .getTrips(query)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (res) => {
          this.total = res.total;
          this.tripsSubject.next(res.items as Trip[]);
        },
        error: () => this.tripsSubject.next([]),
      });
  }
}
