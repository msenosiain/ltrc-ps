import { Component, DestroyRef, OnInit, inject, signal } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { CalendarEvent, CategoryEnum } from '@ltrc-campo/shared-api-model';
import { CalendarService } from '../../services/calendar.service';
import { getCategoryLabel } from '../../../common/category-options';

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

interface DayGroup {
  dateKey: string;      // YYYY-MM-DD
  dateLabel: string;    // dd/MM
  dayName: string;      // Lunes, Martes…
  events: CalendarEvent[];
}

function getWeekBounds(date: Date): { from: Date; to: Date } {
  const d = new Date(date);
  const day = d.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // shift to Monday
  const from = new Date(d);
  from.setDate(d.getDate() + diff);
  from.setHours(0, 0, 0, 0);
  const to = new Date(from);
  to.setDate(from.getDate() + 6);
  to.setHours(23, 59, 59, 999);
  return { from, to };
}

function toDateStr(d: Date): string {
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

@Component({
  selector: 'ltrc-calendar',
  standalone: true,
  imports: [DatePipe, MatButtonModule, MatCardModule, MatIconModule, MatProgressBarModule, MatTooltipModule],
  templateUrl: './calendar.component.html',
  styleUrl: './calendar.component.scss',
})
export class CalendarComponent implements OnInit {
  private readonly calendarService = inject(CalendarService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  loading = signal(false);
  weekAnchor = signal(new Date()); // any date in the displayed week
  days = signal<DayGroup[]>([]);

  get weekLabel(): string {
    const { from, to } = getWeekBounds(this.weekAnchor());
    const fmt = (d: Date) =>
      `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`;
    return `${fmt(from)} – ${fmt(to)} ${to.getFullYear()}`;
  }

  ngOnInit(): void {
    this.loadWeek();
  }

  prevWeek(): void {
    const d = new Date(this.weekAnchor());
    d.setDate(d.getDate() - 7);
    this.weekAnchor.set(d);
    this.loadWeek();
  }

  nextWeek(): void {
    const d = new Date(this.weekAnchor());
    d.setDate(d.getDate() + 7);
    this.weekAnchor.set(d);
    this.loadWeek();
  }

  goToToday(): void {
    this.weekAnchor.set(new Date());
    this.loadWeek();
  }

  private loadWeek(): void {
    const { from, to } = getWeekBounds(this.weekAnchor());
    this.loading.set(true);
    this.calendarService
      .getEvents(toDateStr(from), toDateStr(to))
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (events) => {
          this.days.set(this.groupByDay(events, from));
          this.loading.set(false);
        },
        error: () => {
          this.days.set([]);
          this.loading.set(false);
        },
      });
  }

  private groupByDay(events: CalendarEvent[], weekStart: Date): DayGroup[] {
    const groups: DayGroup[] = [];
    for (let i = 0; i < 7; i++) {
      const d = new Date(weekStart);
      d.setDate(weekStart.getDate() + i);
      const key = toDateStr(d);
      const dayEvents = events.filter((e) => e.date.slice(0, 10) === key);
      if (dayEvents.length > 0) {
        groups.push({
          dateKey: key,
          dateLabel: `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}`,
          dayName: DAY_NAMES[d.getDay()],
          events: dayEvents,
        });
      }
    }
    return groups;
  }

  getEventTime(event: CalendarEvent): string {
    if (event.type === 'training') {
      return event.startTime ?? '';
    }
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
}
