import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, finalize } from 'rxjs';
import {
  PaginationQuery,
  Player,
  PlayerFilters,
} from '@ltrc-ps/shared-api-model';
import { PlayersService } from './players.service';

export class PlayersDataSource implements DataSource<Player> {
  private playersSubject = new BehaviorSubject<Player[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  loading$ = this.loadingSubject.asObservable();
  total = 0;

  constructor(private playersService: PlayersService) {}

  load(
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
        error: (err) => {
          console.error('Error loading players:', err);
          this.playersSubject.next([]);
        },
      });
  }

  connect(_: CollectionViewer): Observable<Player[]> {
    return this.playersSubject.asObservable();
  }

  disconnect(): void {
    this.playersSubject.complete();
    this.loadingSubject.complete();
  }
}
