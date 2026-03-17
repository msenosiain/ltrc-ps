import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import {
  asyncScheduler,
  BehaviorSubject,
  finalize,
  Observable,
  observeOn,
} from 'rxjs';
import { PaginationQuery, SortOrder } from '@ltrc-ps/shared-api-model';
import { User } from '../User.interface';
import { UsersService } from './users.service';

export interface UserFilters {
  searchTerm?: string;
  role?: string;
}

export class UsersDataSource implements DataSource<User> {
  private usersSubject = new BehaviorSubject<User[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  loading$ = this.loadingSubject.asObservable().pipe(observeOn(asyncScheduler));
  total = 0;

  private filters: UserFilters = {};
  private pageIndex = 0;
  private pageSize = 10;
  private sortBy?: string;
  private sortOrder?: SortOrder;

  constructor(private usersService: UsersService) {}

  connect(_: CollectionViewer): Observable<User[]> {
    return this.usersSubject.asObservable();
  }

  disconnect(): void {
    this.usersSubject.complete();
    this.loadingSubject.complete();
  }

  /** Set page/sort state without loading — use before first setFilters call */
  configure(pageIndex: number, pageSize: number, sortBy?: string, sortOrder?: SortOrder): void {
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
  }

  setFilters(filters: UserFilters): void {
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

    this.usersService
      .getUsers(query)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (res) => {
          this.total = res.total;
          this.usersSubject.next(res.items);
        },
        error: () => this.usersSubject.next([]),
      });
  }
}
