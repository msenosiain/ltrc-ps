import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { take } from 'rxjs';
import { MatDialog } from '@angular/material/dialog';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CalendarEvent, CategoryEnum, HockeyBranchEnum, SportEnum } from '@ltrc-campo/shared-api-model';
import { CalendarService } from '../../services/calendar.service';
import { getCategoryLabel } from '../../../common/category-options';
import { UserFilterContextService, FilterContext } from '../../../common/services/user-filter-context.service';
import {
  ScopeFilterDialogComponent,
  ScopeFilterDialogData,
  ScopeFilterSelection,
} from '../../../common/components/scope-filter-dialog/scope-filter-dialog.component';

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

interface DayGroup {
  dateKey: string;
  dateLabel: string;
  dayName: string;
  events: CalendarEvent[];
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

function getWeekBounds(): { weekStart: Date; weekEnd: Date } {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const day = today.getDay();
  const mondayOffset = day === 0 ? -6 : 1 - day;
  const weekStart = new Date(today);
  weekStart.setDate(today.getDate() + mondayOffset);
  const weekEnd = new Date(weekStart);
  weekEnd.setDate(weekStart.getDate() + 6);
  return { weekStart, weekEnd };
}

@Component({
  selector: 'ltrc-calendar-week-widget',
  standalone: true,
  imports: [MatIconModule, MatProgressBarModule, MatButtonModule, MatTooltipModule],
  templateUrl: './calendar-week-widget.component.html',
  styleUrl: './calendar-week-widget.component.scss',
})
export class CalendarWeekWidgetComponent implements OnInit {
  private readonly calendarService = inject(CalendarService);
  private readonly filterContextService = inject(UserFilterContextService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly SportEnum = SportEnum;

  loading = true;
  days: DayGroup[] = [];

  private filterContext: FilterContext | null = null;
  private selected: ScopeFilterSelection = {};

  get hasFilters(): boolean {
    return !!(this.selected.sport || this.selected.category || this.selected.branch);
  }

  get showFilterButton(): boolean {
    if (!this.filterContext) return false;
    return (
      this.filterContext.sportOptions.length > 1 ||
      this.filterContext.categoryOptions.length > 1 ||
      (this.filterContext.showBranchFilter && this.filterContext.branchOptions.length > 1)
    );
  }

  ngOnInit(): void {
    this.filterContextService.filterContext$
      .pipe(take(1), takeUntilDestroyed(this.destroyRef))
      .subscribe((ctx) => {
        this.filterContext = ctx;
        // Auto-apply forced values
        if (ctx.forcedSport) this.selected = { ...this.selected, sport: ctx.forcedSport };
        if (ctx.forcedCategory) this.selected = { ...this.selected, category: ctx.forcedCategory };
        if (ctx.forcedBranch) this.selected = { ...this.selected, branch: ctx.forcedBranch };
        this.load();
      });
  }

  openFilters(): void {
    if (!this.filterContext) return;
    const ref = this.dialog.open(ScopeFilterDialogComponent, {
      width: '320px',
      data: { filterContext: this.filterContext, selected: { ...this.selected } } satisfies ScopeFilterDialogData,
    });
    ref.afterClosed().subscribe((result: ScopeFilterSelection | undefined) => {
      if (result === undefined) return; // dismissed
      this.selected = result;
      this.load();
    });
  }

  private load(): void {
    const { weekStart, weekEnd } = getWeekBounds();
    this.loading = true;
    this.calendarService
      .getEvents(toDateStr(weekStart), toDateStr(weekEnd), this.selected.sport, this.selected.category)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (events) => {
          this.days = this.groupByDay(events, weekStart, weekEnd);
          this.loading = false;
        },
        error: () => {
          this.days = [];
          this.loading = false;
        },
      });
  }

  private groupByDay(events: CalendarEvent[], from: Date, to: Date): DayGroup[] {
    const todayStr = toDateStr(new Date());
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = toDateStr(tomorrow);
    const groups: DayGroup[] = [];

    for (let d = new Date(from); d <= to; d.setDate(d.getDate() + 1)) {
      const key = toDateStr(d);
      const dayEvents = events.filter((e) => e.date.slice(0, 10) === key);
      if (dayEvents.length === 0) continue;

      let dayName: string;
      if (key === todayStr) dayName = 'Hoy';
      else if (key === tomorrowStr) dayName = 'Mañana';
      else dayName = DAY_NAMES[d.getDay()];

      groups.push({
        dateKey: key,
        dateLabel: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
        dayName,
        events: dayEvents,
      });
    }
    return groups;
  }

  getEventTime(event: CalendarEvent): string {
    if (event.type === 'training') return event.startTime ?? '';
    const d = new Date(event.date);
    if (d.getUTCHours() === 0 && d.getUTCMinutes() === 0) return '';
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  }

  getCategoryLabel(category: CategoryEnum): string {
    return getCategoryLabel(category);
  }

  navigate(event: CalendarEvent): void {
    if (event.type === 'match') {
      this.router.navigate(['/dashboard/matches', event.id]);
    } else {
      this.router.navigate(['/dashboard/trainings/sessions', event.id]);
    }
  }

  goToCalendar(): void {
    this.router.navigate(['/dashboard/calendar']);
  }
}
