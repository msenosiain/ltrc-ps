import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { CalendarEvent, CategoryEnum, SportEnum } from '@ltrc-campo/shared-api-model';
import { CalendarService } from '../../services/calendar.service';
import { getCategoryLabel } from '../../../common/category-options';

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

@Component({
  selector: 'ltrc-calendar-week-widget',
  standalone: true,
  imports: [MatIconModule, MatProgressBarModule],
  templateUrl: './calendar-week-widget.component.html',
  styleUrl: './calendar-week-widget.component.scss',
})
export class CalendarWeekWidgetComponent implements OnInit {
  private readonly calendarService = inject(CalendarService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  readonly SportEnum = SportEnum;

  loading = true;
  days: DayGroup[] = [];

  ngOnInit(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const end = new Date(today);
    end.setDate(today.getDate() + 13); // next 2 weeks

    this.calendarService
      .getEvents(toDateStr(today), toDateStr(end))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (events) => {
          this.days = this.groupByDay(events, today, end);
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
    const tomorrowStr = toDateStr(new Date(new Date().setDate(new Date().getDate() + 1)));
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
