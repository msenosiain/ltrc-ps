import {
  AfterViewInit,
  Component,
  inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { AsyncPipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { Router } from '@angular/router';
import { RoleEnum, SortOrder, SportEnum, TripStatusEnum } from '@ltrc-ps/shared-api-model';
import { TripsService } from '../../services/trips.service';
import { TripsDataSource, TripListFilters } from '../../services/trips.datasource';
import { TripSearchComponent } from '../trip-search/trip-search.component';
import { AllowedRolesDirective } from '../../../auth/directives/allowed-roles.directive';
import { ListStateService } from '../../../common/services/list-state.service';
import { getTripStatusLabel } from '../../trip-options';
import { sportOptions } from '../../../common/sport-options';

@Component({
  selector: 'ltrc-trip-list',
  standalone: true,
  imports: [
    AsyncPipe,
    DatePipe,
    MatTableModule,
    MatProgressBarModule,
    MatIconModule,
    MatButtonModule,
    MatSortModule,
    MatPaginatorModule,
    MatChipsModule,
    TripSearchComponent,
    AllowedRolesDirective,
  ],
  templateUrl: './trip-list.component.html',
  styleUrl: './trip-list.component.scss',
})
export class TripListComponent implements AfterViewInit, OnDestroy {
  private static readonly STATE_KEY = 'trips';

  private readonly router = inject(Router);
  private readonly tripsService = inject(TripsService);
  private readonly listState = inject(ListStateService);

  readonly RoleEnum = RoleEnum;
  readonly displayedColumns = [
    'name',
    'destination',
    'sport',
    'departureDate',
    'status',
    'participants',
  ];

  @ViewChild(MatSort) sort!: MatSort;
  @ViewChild(MatPaginator) paginator!: MatPaginator;

  readonly dataSource = new TripsDataSource(this.tripsService);
  readonly savedState = this.listState.get(TripListComponent.STATE_KEY);
  private currentFilters: TripListFilters = this.savedState?.filters ?? {};

  ngAfterViewInit(): void {
    const s = this.savedState;
    const pageIndex = s?.pageIndex ?? 0;
    const pageSize = s?.pageSize ?? 10;

    this.paginator.pageIndex = pageIndex;
    this.paginator.pageSize = pageSize;

    if (s?.sortBy) {
      this.sort.active = s.sortBy;
      this.sort.direction = (s.sortOrder as '' | 'asc' | 'desc') ?? 'desc';
    }

    this.dataSource.configure(pageIndex, pageSize, s?.sortBy, s?.sortOrder);

    this.sort.sortChange.subscribe(() => {
      this.paginator.pageIndex = 0;
      this.dataSource.setSorting(
        this.sort.active,
        (this.sort.direction as SortOrder) || SortOrder.DESC
      );
      this.saveState();
    });

    this.paginator.page.subscribe(() => {
      this.dataSource.setPage(this.paginator.pageIndex, this.paginator.pageSize);
      this.saveState();
    });
  }

  ngOnDestroy(): void {
    this.saveState();
  }

  applyFilters(filters: TripListFilters): void {
    this.currentFilters = filters;
    if (this.paginator) this.paginator.pageIndex = 0;
    this.dataSource.setFilters(filters);
    this.saveState();
  }

  getSportLabel(sport?: SportEnum): string {
    return sportOptions.find((s) => s.id === sport)?.label ?? '';
  }

  getStatusLabel(status: TripStatusEnum): string {
    return getTripStatusLabel(status);
  }

  goToCreate(): void {
    this.router.navigate(['/dashboard/trips/create']);
  }

  viewTrip(tripId: string): void {
    this.router.navigate(['/dashboard/trips', tripId]);
  }

  private saveState(): void {
    this.listState.save(TripListComponent.STATE_KEY, {
      filters: this.currentFilters,
      pageIndex: this.paginator?.pageIndex ?? 0,
      pageSize: this.paginator?.pageSize ?? 10,
      sortBy: this.sort?.active,
      sortOrder: this.sort?.direction as SortOrder,
    });
  }
}
