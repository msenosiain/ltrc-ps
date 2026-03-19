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
  Player,
  PlayerFilters,
  SortOrder,
} from '@ltrc-campo/shared-api-model';
import { PlayersService } from './players.service';

export class PlayersDataSource implements DataSource<Player> {
  private playersSubject = new BehaviorSubject<Player[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  loading$ = this.loadingSubject.asObservable().pipe(observeOn(asyncScheduler));
  total = 0;

  private filters: PlayerFilters = {};
  private pageIndex = 0;
  private pageSize = 10;
  private sortBy?: string;
  private sortOrder?: SortOrder;

  constructor(private playersService: PlayersService) {}

  connect(_: CollectionViewer): Observable<Player[]> {
    return this.playersSubject.asObservable();
  }

  disconnect(): void {
    this.playersSubject.complete();
    this.loadingSubject.complete();
  }

  /** Set page/sort state without loading — use before first setFilters call */
  configure(pageIndex: number, pageSize: number, sortBy?: string, sortOrder?: SortOrder): void {
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
  }

  setFilters(filters: PlayerFilters): void {
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

  private load() {
    this.loadingSubject.next(true);

    const query: PaginationQuery = {
      page: this.pageIndex + 1,
      size: this.pageSize,
      filters: this.filters,
      sortBy: this.sortBy,
      sortOrder: this.sortOrder,
    };

    this.playersService
      .getPlayers(query)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (res) => {
          this.total = res.total;
          this.playersSubject.next(res.items);
        },
        error: () => this.playersSubject.next([]),
      });
  }
}
