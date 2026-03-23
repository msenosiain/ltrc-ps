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
  SportEnum,
  Tournament,
} from '@ltrc-campo/shared-api-model';
import { TournamentsService } from './tournaments.service';

export interface TournamentFilters {
  searchTerm?: string;
  sport?: SportEnum;
}

export class TournamentsDataSource implements DataSource<Tournament> {
  private tournamentsSubject = new BehaviorSubject<Tournament[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  loading$ = this.loadingSubject.asObservable().pipe(observeOn(asyncScheduler));
  total = 0;

  private filters: TournamentFilters = {};
  private pageIndex = 0;
  private pageSize = 10;
  private sortBy?: string;
  private sortOrder?: SortOrder;

  constructor(private tournamentsService: TournamentsService) {}

  connect(_: CollectionViewer): Observable<Tournament[]> {
    return this.tournamentsSubject.asObservable();
  }

  disconnect(): void {
    this.tournamentsSubject.complete();
    this.loadingSubject.complete();
  }

  /** Set page/sort state without loading — use before first setFilters call */
  configure(pageIndex: number, pageSize: number, sortBy?: string, sortOrder?: SortOrder): void {
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
  }

  setFilters(filters: TournamentFilters, pageIndex = 0): void {
    this.filters = filters;
    this.pageIndex = pageIndex;
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

    this.tournamentsService
      .getTournaments(query)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (res) => {
          this.total = res.total;
          this.tournamentsSubject.next(res.items as Tournament[]);
        },
        error: () => this.tournamentsSubject.next([]),
      });
  }
}
