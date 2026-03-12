import { AfterViewInit, Component, inject, ViewChild } from '@angular/core';
import { AsyncPipe, NgClass } from '@angular/common';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { Role, SortOrder } from '@ltrc-ps/shared-api-model';
import { UsersService } from '../../services/users.service';
import { UsersDataSource, UserFilters } from '../../services/users.datasource';
import { UserSearchComponent } from '../user-search/user-search.component';
import { getRoleLabel, getRoleClass } from '../../user-options';
import { User } from '../../User.interface';

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
export class UsersListComponent implements AfterViewInit {
  private readonly router = inject(Router);
  private readonly usersService = inject(UsersService);

  readonly displayedColumns = ['name', 'email', 'roles', 'actions'];
  readonly dataSource = new UsersDataSource(this.usersService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit(): void {
    this.dataSource.setPage(0, 10);

    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.dataSource.setSorting(
        this.sort.active,
        this.sort.direction as SortOrder
      );
    });

    this.paginator.page.subscribe(() => {
      this.dataSource.setPage(
        this.paginator.pageIndex,
        this.paginator.pageSize
      );
    });
  }

  applyFilters(filters: UserFilters): void {
    this.paginator.pageIndex = 0;
    this.dataSource.setFilters(filters);
  }

  goToCreate(): void {
    this.router.navigate(['/dashboard/users/create']);
  }

  viewUser(user: User): void {
    const id = (user as any)._id ?? user.id;
    this.router.navigate(['/dashboard/users', id]);
  }

  getRoleLabel(role: Role): string {
    return getRoleLabel(role);
  }

  getRoleClass(role: Role): string {
    return getRoleClass(role);
  }
}
