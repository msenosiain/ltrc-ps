import { AfterViewInit, Component, inject, OnDestroy, ViewChild } from '@angular/core';
import { AsyncPipe, NgClass } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { RoleEnum, SortOrder } from '@ltrc-ps/shared-api-model';
import { UsersService } from '../../services/users.service';
import { UsersDataSource, UserFilters } from '../../services/users.datasource';
import { UserSearchComponent } from '../user-search/user-search.component';
import { getRoleLabel, getRoleClass } from '../../user-options';
import { getCategoryLabel } from '../../../common/category-options';
import { User } from '../../User.interface';
import { ListStateService } from '../../../common/services/list-state.service';

@Component({
  selector: 'ltrc-users-list',
  standalone: true,
  imports: [
    AsyncPipe,
    NgClass,
    MatTableModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    UserSearchComponent,
  ],
  templateUrl: './users-list.component.html',
  styleUrl: './users-list.component.scss',
})
export class UsersListComponent implements AfterViewInit, OnDestroy {
  private static readonly STATE_KEY = 'users';
  private readonly router = inject(Router);
  private readonly usersService = inject(UsersService);
  private readonly listState = inject(ListStateService);

  readonly displayedColumns = ['name', 'roles', 'categories', 'branches', 'email', 'actions'];
  readonly dataSource = new UsersDataSource(this.usersService);
  readonly savedState = this.listState.get(UsersListComponent.STATE_KEY);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private currentFilters: UserFilters = this.savedState?.filters ?? {};

  ngAfterViewInit(): void {
    const s = this.savedState;
    const pageIndex = s?.pageIndex ?? 0;
    const pageSize = s?.pageSize ?? 10;

    this.paginator.pageIndex = pageIndex;
    this.paginator.pageSize = pageSize;

    if (s?.sortBy) {
      this.sort.active = s.sortBy;
      this.sort.direction = (s.sortOrder as '' | 'asc' | 'desc') || '';
    }

    if (s?.sortBy) {
      this.dataSource.setSorting(s.sortBy, s.sortOrder!);
    }
    this.dataSource.setPage(pageIndex, pageSize);

    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.dataSource.setSorting(
        this.sort.active,
        this.sort.direction as SortOrder
      );
      this.saveState();
    });

    this.paginator.page.subscribe(() => {
      this.dataSource.setPage(
        this.paginator.pageIndex,
        this.paginator.pageSize
      );
      this.saveState();
    });
  }

  ngOnDestroy(): void {
    this.saveState();
  }

  applyFilters(filters: UserFilters): void {
    this.currentFilters = filters;
    this.paginator.pageIndex = 0;
    this.dataSource.setFilters(filters);
    this.saveState();
  }

  private saveState(): void {
    this.listState.save(UsersListComponent.STATE_KEY, {
      filters: this.currentFilters,
      pageIndex: this.paginator?.pageIndex ?? 0,
      pageSize: this.paginator?.pageSize ?? 10,
      sortBy: this.sort?.active,
      sortOrder: this.sort?.direction as SortOrder,
    });
  }

  goToCreate(): void {
    this.router.navigate(['/dashboard/users/create']);
  }

  viewUser(user: User): void {
    const id = (user as any)._id ?? user.id;
    this.router.navigate(['/dashboard/users', id]);
  }

  getRoleLabel(role: RoleEnum): string {
    return getRoleLabel(role);
  }

  getRoleClass(role: RoleEnum): string {
    return getRoleClass(role);
  }

  getCategoriesLabel(user: User): string {
    return user.categories?.map(getCategoryLabel).join(', ') || '';
  }
}
