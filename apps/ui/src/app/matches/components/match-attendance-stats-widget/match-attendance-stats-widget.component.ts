import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { BlockEnum, CategoryEnum, getBlockCategories } from '@ltrc-campo/shared-api-model';
import { MatchesService } from '../../services/matches.service';
import { UserFilterContextService, FilterContext } from '../../../common/services/user-filter-context.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getCategoryLabel } from '../../../common/category-options';
import {
  ScopeFilterDialogComponent,
  ScopeFilterDialogData,
  ScopeFilterSelection,
} from '../../../common/components/scope-filter-dialog/scope-filter-dialog.component';
import { WidgetShellComponent } from '../../../common/components/widget-shell/widget-shell.component';

interface CategoryAttStat {
  category: CategoryEnum;
  label: string;
  matches: number;
  pct: number;
}

interface BlockAttStat {
  block: BlockEnum;
  label: string;
  categories: CategoryAttStat[];
  avgPct: number;
}

const BLOCK_LABELS: Record<BlockEnum, string> = {
  [BlockEnum.INFANTILES]: 'Infantiles',
  [BlockEnum.CADETES]: 'Cadetes',
  [BlockEnum.JUVENILES]: 'Juveniles',
  [BlockEnum.MAYORES]: 'Mayores',
  [BlockEnum.PLANTEL_SUPERIOR]: 'Plantel Superior',
};

@Component({
  selector: 'ltrc-match-attendance-stats-widget',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, WidgetShellComponent],
  templateUrl: './match-attendance-stats-widget.component.html',
  styleUrl: './match-attendance-stats-widget.component.scss',
})
export class MatchAttendanceStatsWidgetComponent implements OnInit {
  private readonly matchesService = inject(MatchesService);
  private readonly filterContextService = inject(UserFilterContextService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  private filterContext: FilterContext | null = null;
  selected: ScopeFilterSelection = {};

  get showFilterButton(): boolean {
    if (!this.filterContext) return false;
    return this.filterContext.sportOptions.length > 1 || this.filterContext.categoryOptions.length > 1;
  }

  get hasFilters(): boolean {
    return !!(this.selected.sport || this.selected.category);
  }

  loading = true;
  blocks: BlockAttStat[] = [];

  ngOnInit(): void {
    this.filterContextService.filterContext$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ctx) => {
        this.filterContext = ctx;
        if (ctx.forcedSport) this.selected = { ...this.selected, sport: ctx.forcedSport };
        if (ctx.forcedCategory) this.selected = { ...this.selected, category: ctx.forcedCategory };
        this.loadStats();
      });
  }

  openFilters(): void {
    if (!this.filterContext) return;
    this.dialog.open(ScopeFilterDialogComponent, {
      width: '320px',
      data: { filterContext: this.filterContext, selected: { ...this.selected } } satisfies ScopeFilterDialogData,
    }).afterClosed().subscribe((result: ScopeFilterSelection | undefined) => {
      if (result === undefined) return;
      this.selected = result;
      this.loadStats();
    });
  }

  private loadStats(): void {
    this.loading = true;
    this.matchesService
      .getAttendanceStats({ sport: this.selected.sport, category: this.selected.category })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (stats) => {
          this.blocks = this.buildBlocks(stats.byCategory);
          this.loading = false;
        },
        error: () => { this.loading = false; },
      });
  }

  private buildBlocks(byCategory: Record<string, { matches: number; pct: number }>): BlockAttStat[] {
    const result: BlockAttStat[] = [];
    for (const block of Object.values(BlockEnum)) {
      const cats = getBlockCategories(block)
        .filter((cat) => byCategory[cat] !== undefined)
        .map((cat) => ({
          category: cat,
          label: getCategoryLabel(cat),
          matches: byCategory[cat].matches,
          pct: byCategory[cat].pct,
        }));
      if (!cats.length) continue;
      const avgPct = cats.length ? Math.round(cats.reduce((s, c) => s + c.pct, 0) / cats.length) : 0;
      result.push({ block, label: BLOCK_LABELS[block], categories: cats, avgPct });
    }
    return result;
  }

  getPctClass(pct: number): string {
    if (pct >= 70) return 'pct-high';
    if (pct >= 40) return 'pct-mid';
    return 'pct-low';
  }
}
