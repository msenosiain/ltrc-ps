import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { DatePipe } from '@angular/common';
import { Router } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import {
  CategoryEnum,
  Match,
  MatchStatusEnum,
  RoleEnum,
  SortOrder,
  SportEnum,
} from '@ltrc-campo/shared-api-model';
import { MatchesService } from '../../services/matches.service';
import { getCategoryLabel } from '../../match-options';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { UserFilterContextService } from '../../../common/services/user-filter-context.service';
import { AuthService } from '../../../auth/auth.service';
import { PlayersService } from '../../../players/services/players.service';
import { MatchFilters } from '../../forms/match-form.types';
import { catchError, map, of, switchMap, take } from 'rxjs';

const DAY_NAMES = ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'];

interface GroupedMatches {
  date: string;
  dayLabel: string;
  matches: Match[];
}

@Component({
  selector: 'ltrc-upcoming-matches-widget',
  standalone: true,
  imports: [DatePipe, MatIconModule, MatProgressBarModule],
  templateUrl: './upcoming-matches-widget.component.html',
  styleUrl: './upcoming-matches-widget.component.scss',
})
export class UpcomingMatchesWidgetComponent implements OnInit {
  private readonly matchesService = inject(MatchesService);
  private readonly filterContextService = inject(UserFilterContextService);
  private readonly authService = inject(AuthService);
  private readonly playersService = inject(PlayersService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  grouped: GroupedMatches[] = [];
  loading = true;

  ngOnInit(): void {
    this.authService.user$.pipe(
      take(1),
      switchMap((user) => {
        const isPlayer = user?.roles?.includes(RoleEnum.PLAYER) ?? false;
        const hasScope = !!(user?.sports?.length || user?.categories?.length);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const fromDate = today.toISOString();

        // Players without scope in JWT → derive from linked player record
        if (isPlayer && !hasScope) {
          return this.playersService.getMyPlayer().pipe(
            catchError(() => of(null)),
            map((player) => {
              const filters: MatchFilters = { status: MatchStatusEnum.UPCOMING, fromDate };
              if (player?.sport) filters.sport = player.sport as SportEnum;
              if (player?.category) filters.category = player.category as CategoryEnum;
              return filters;
            })
          );
        }

        // Staff / coaches with scope from JWT
        return this.filterContextService.filterContext$.pipe(
          take(1),
          map((ctx) => {
            const filters: MatchFilters = { status: MatchStatusEnum.UPCOMING, fromDate };
            if (ctx.forcedSport) filters.sport = ctx.forcedSport;
            if (ctx.forcedCategory) filters.category = ctx.forcedCategory;
            return filters;
          })
        );
      }),
      switchMap((filters) =>
        this.matchesService.getMatches({
          page: 1,
          size: 20,
          filters,
          sortBy: 'date',
          sortOrder: SortOrder.ASC,
        })
      ),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe({
      next: (res) => {
        this.grouped = this.groupByDate(res.items);
        this.loading = false;
      },
      error: () => {
        this.grouped = [];
        this.loading = false;
      },
    });
  }

  private groupByDate(matches: Match[]): GroupedMatches[] {
    const map = new Map<string, Match[]>();
    for (const m of matches) {
      const d = new Date(m.date!);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
      const list = map.get(key) ?? [];
      list.push(m);
      map.set(key, list);
    }

    const today = new Date();
    today.setHours(12, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    return Array.from(map.entries()).map(([dateKey, items]) => {
      const d = new Date(dateKey + 'T12:00:00');
      let dayLabel: string;
      if (d.toDateString() === today.toDateString()) {
        dayLabel = 'Hoy';
      } else if (d.toDateString() === tomorrow.toDateString()) {
        dayLabel = 'Mañana';
      } else {
        dayLabel = DAY_NAMES[d.getDay()];
      }
      const [y, mo, day] = dateKey.split('-');
      return { date: `${day}/${mo}/${y}`, dayLabel, matches: items };
    });
  }

  getCategoryLabel(match: Match): string {
    return getCategoryLabel(match.category);
  }

  hasTime(date: string | Date | undefined): boolean {
    if (!date) return false;
    const d = new Date(date);
    return d.getHours() !== 0 || d.getMinutes() !== 0;
  }

  goToMatch(matchId: string): void {
    this.router.navigate(['/dashboard/matches', matchId]);
  }
}
