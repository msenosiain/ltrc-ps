import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, Observable, finalize } from 'rxjs';
import { PlayersService } from './players.service';
import { Player } from '@ltrc-ps/shared-api-model';

export class PlayersDataSource implements DataSource<Player> {
  private playersSubject = new BehaviorSubject<Player[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  public loading$ = this.loadingSubject.asObservable();
  public total = 0;

  constructor(private playersService: PlayersService) {}

  load(
    pageIndex: number,
    pageSize: number,
    sort?: string,
    order?: 'asc' | 'desc'
  ) {
    this.loadingSubject.next(true);

    this.playersService
      .getPlayers(pageIndex + 1, pageSize, sort, order)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe((res) => {
        this.total = res.total;
        this.playersSubject.next(res.items);
      });
  }

  connect(collectionViewer: CollectionViewer): Observable<Player[]> {
    return this.playersSubject.asObservable();
  }

  disconnect(): void {
    this.playersSubject.complete();
    this.loadingSubject.complete();
  }
}
