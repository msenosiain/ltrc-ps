import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import { BehaviorSubject, finalize, Observable } from 'rxjs';
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

  loading$ = this.loadingSubject.asObservable();
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

  setFilters(filters: UserFilters): void {
    this.filters = filters;
    this.pageIndex = 0;
    this.load(
      this.pageIndex,
      this.pageSize,
      this.filters,
      this.sortBy,
      this.sortOrder
    );
  }

  setSorting(sortBy: string, sortOrder: SortOrder): void {
    this.sortBy = sortBy;
    this.sortOrder = sortOrder;
    this.load(
      this.pageIndex,
      this.pageSize,
      this.filters,
      this.sortBy,
      this.sortOrder
    );
  }

  setPage(pageIndex: number, pageSize: number): void {
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.load(
      this.pageIndex,
      this.pageSize,
      this.filters,
      this.sortBy,
      this.sortOrder
    );
  }

  private load(
    pageIndex: number,
    pageSize: number,
    filters: UserFilters = {},
    sortBy?: string,
    sortOrder?: SortOrder
  ) {
    this.loadingSubject.next(true);

    const query: PaginationQuery = {
      page: pageIndex + 1,
      size: pageSize,
      filters,
      sortBy,
      sortOrder,
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
