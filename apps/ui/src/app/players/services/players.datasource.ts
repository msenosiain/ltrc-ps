import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, finalize, Observable } from 'rxjs';
import { PaginationQuery, Player, PlayerFilters } from '@ltrc-ps/shared-api-model';
import { PlayersService } from './players.service';

export class PlayersDataSource implements DataSource<Player> {
  private playersSubject = new BehaviorSubject<Player[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  loading$ = this.loadingSubject.asObservable();
  total = 0;

  private filters: PlayerFilters = {};
  private pageIndex = 0;
  private pageSize = 10;
  private sortBy?: string;
  private sortOrder?: 'asc' | 'desc';

  constructor(private playersService: PlayersService) {}

  connect(_: CollectionViewer): Observable<Player[]> {
    return this.playersSubject.asObservable();
  }

  disconnect(): void {
    this.playersSubject.complete();
    this.loadingSubject.complete();
  }

  setFilters(filters: PlayerFilters): void {
    this.filters = filters;
    this.pageIndex = 0;
    this.load(this.pageIndex, this.pageSize, this.filters, this.sortBy, this.sortOrder);
  }

  setSorting(sortBy: string, sortOrder: 'asc' | 'desc'): void {
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    this.load(this.pageIndex, this.pageSize, this.filters, this.sortBy, this.sortOrder);
  }

  setPage(pageIndex: number, pageSize: number): void {
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.load(this.pageIndex, this.pageSize, this.filters, this.sortBy, this.sortOrder);
  }

  private load(
    pageIndex: number,
    pageSize: number,
    filters: PlayerFilters = {},
    sortBy?: string,
    sortOrder?: 'asc' | 'desc'
  ) {
    this.loadingSubject.next(true);

    const query: PaginationQuery = {
      page: pageIndex + 1,
      size: pageSize,
      filters,
      sortBy,
      sortOrder,
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
