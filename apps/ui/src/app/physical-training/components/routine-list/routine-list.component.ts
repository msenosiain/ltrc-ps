import {
  AfterViewInit,
  ChangeDetectorRef,
  Component,
  DestroyRef,
  inject,
  OnDestroy,
  OnInit,
  ViewChild,
} from '@angular/core';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSort, MatSortModule } from '@angular/material/sort';
import { MatTableModule } from '@angular/material/table';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { AsyncPipe } from '@angular/common';
import { Router } from '@angular/router';
import { CollectionViewer, DataSource } from '@angular/cdk/collections';
import {
  BehaviorSubject,
  finalize,
  Observable,
  asyncScheduler,
  observeOn,
} from 'rxjs';
import { PaginationQuery, Routine, RoleEnum, SortOrder } from '@ltrc-campo/shared-api-model';
import { RoutinesService } from '../../services/routines.service';
import { getRoutineStatusLabel } from '../../physical-training-options';
import { AllowedRolesDirective } from '../../../auth/directives/allowed-roles.directive';

class RoutinesDataSource implements DataSource<Routine> {
  private itemsSubject = new BehaviorSubject<Routine[]>([]);
  private loadingSubject = new BehaviorSubject<boolean>(false);

  loading$ = this.loadingSubject.asObservable().pipe(observeOn(asyncScheduler));
  total = 0;

  private pageIndex = 0;
  private pageSize = 10;

  constructor(private service: RoutinesService) {}

  connect(_: CollectionViewer): Observable<Routine[]> {
    return this.itemsSubject.asObservable();
  }

  disconnect(): void {
    this.itemsSubject.complete();
    this.loadingSubject.complete();
  }

  setPage(pageIndex: number, pageSize: number): void {
    this.pageIndex = pageIndex;
    this.pageSize = pageSize;
    this.load();
  }

  load(): void {
    this.loadingSubject.next(true);
    const query: PaginationQuery = {
      page: this.pageIndex + 1,
      size: this.pageSize,
      sortBy: 'name',
      sortOrder: SortOrder.ASC,
    };
    this.service
      .getRoutines(query)
      .pipe(finalize(() => this.loadingSubject.next(false)))
      .subscribe({
        next: (res) => {
          this.total = res.total;
          this.itemsSubject.next(res.items);
        },
        error: () => this.itemsSubject.next([]),
      });
  }
}

@Component({
  selector: 'ltrc-routine-list',
  standalone: true,
  imports: [
    MatTableModule,
    MatProgressBarModule,
    MatPaginatorModule,
    MatSortModule,
    MatIconModule,
    MatButtonModule,
    AsyncPipe,
    AllowedRolesDirective,
  ],
  templateUrl: './routine-list.component.html',
  styleUrl: './routine-list.component.scss',
})
export class RoutineListComponent implements AfterViewInit, OnDestroy {
  private readonly router = inject(Router);
  private readonly routinesService = inject(RoutinesService);
  private readonly cdr = inject(ChangeDetectorRef);

  readonly RoleEnum = RoleEnum;
  readonly displayedColumns = ['name', 'sport', 'category', 'validity', 'status', 'players'];
  readonly dataSource = new RoutinesDataSource(this.routinesService);

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngAfterViewInit(): void {
    this.dataSource.load();
    this.cdr.detectChanges();

    this.paginator.page.subscribe(() => {
      this.dataSource.setPage(this.paginator.pageIndex, this.paginator.pageSize);
    });
  }

  ngOnDestroy(): void {}

  getStatusLabel(status: string): string {
    return getRoutineStatusLabel(status);
  }

  viewDetails(id: string): void {
    this.router.navigate(['/dashboard/physical/routines', id]);
  }

  createRoutine(): void {
    this.router.navigate(['/dashboard/physical/routines/new']);
  }

  goToExercises(): void {
    this.router.navigate(['/dashboard/physical/exercises']);
  }
}
