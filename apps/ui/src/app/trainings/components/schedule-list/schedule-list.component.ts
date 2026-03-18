import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  inject,
  OnDestroy,
  ViewChild,
} from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatChipsModule } from '@angular/material/chips';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import {
  RoleEnum,
  SortOrder,
  TrainingSchedule,
} from '@ltrc-ps/shared-api-model';
import { TrainingSchedulesService } from '../../services/training-schedules.service';
import { SchedulesDataSource } from '../../services/schedules.datasource';
import { ScheduleFilters } from '../../forms/schedule-form.types';
import { ScheduleSearchComponent } from '../schedule-search/schedule-search.component';
import { AllowedRolesDirective } from '../../../auth/directives/allowed-roles.directive';
import { ListStateService } from '../../../common/services/list-state.service';
import { getCategoryLabel, getDayLabel } from '../../training-options';
import { getSportLabel } from '../../../common/sport-options';

@Component({
  selector: 'ltrc-schedule-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    MatChipsModule,
    AsyncPipe,
    ScheduleSearchComponent,
    AllowedRolesDirective,
  ],
  templateUrl: './schedule-list.component.html',
  styleUrl: './schedule-list.component.scss',
})
export class ScheduleListComponent implements AfterViewInit, OnDestroy {
  private static readonly STATE_KEY = 'schedules';
  private readonly router = inject(Router);
  private readonly schedulesService = inject(TrainingSchedulesService);
  private readonly cdr = inject(ChangeDetectorRef);
  private readonly listState = inject(ListStateService);

  readonly RoleEnum = RoleEnum;
  readonly displayedColumns = [
    'sport',
    'category',
    'timeSlots',
    'isActive',
  ];
  readonly dataSource = new SchedulesDataSource(this.schedulesService);
  readonly savedState = this.listState.get(ScheduleListComponent.STATE_KEY);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  private currentFilters: ScheduleFilters = this.savedState?.filters ?? {};

  ngAfterViewInit(): void {
    const s = this.savedState;
    const pageIndex = s?.pageIndex ?? 0;
    const pageSize = s?.pageSize ?? 10;
    const sortBy = s?.sortBy || 'sport';
    const sortOrder = s?.sortOrder || SortOrder.ASC;

    this.paginator.pageIndex = pageIndex;
    this.paginator.pageSize = pageSize;
    this.sort.active = sortBy;
    this.sort.direction = sortOrder as '' | 'asc' | 'desc';

    this.dataSource.configure(pageIndex, pageSize, sortBy, sortOrder);
    this.cdr.detectChanges();

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

  applyFilters(filters: ScheduleFilters): void {
    this.currentFilters = filters;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.dataSource.setFilters(filters);
    this.saveState();
  }

  private saveState(): void {
    this.listState.save(ScheduleListComponent.STATE_KEY, {
      filters: this.currentFilters,
      pageIndex: this.paginator?.pageIndex ?? 0,
      pageSize: this.paginator?.pageSize ?? 10,
      sortBy: this.sort?.active,
      sortOrder: this.sort?.direction as SortOrder,
    });
  }

  goToCreate(): void {
    this.router.navigate(['/dashboard/trainings/schedules/create']);
  }

  viewDetails(id: string): void {
    this.router.navigate(['/dashboard/trainings/schedules', id]);
  }

  getSportLabel(schedule: TrainingSchedule): string {
    return getSportLabel(schedule.sport);
  }

  getCategoryLabel(schedule: TrainingSchedule): string {
    return getCategoryLabel(schedule.category);
  }

  getTimeSlotsLabel(schedule: TrainingSchedule): string {
    return schedule.timeSlots
      .map((s) => {
        const base = `${getDayLabel(s.day)} ${s.startTime}-${s.endTime}`;
        return s.location ? `${base} (${s.location})` : base;
      })
      .join(', ');
  }
}
