import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import {
  BlockEnum,
  CategoryEnum,
  SportEnum,
  getBlockCategories,
} from '@ltrc-campo/shared-api-model';
import { PlayersService } from '../../services/players.service';
import { UserFilterContextService, FilterContext } from '../../../common/services/user-filter-context.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getCategoryLabel } from '../../../common/category-options';
import {
  ScopeFilterDialogComponent,
  ScopeFilterDialogData,
  ScopeFilterSelection,
} from '../../../common/components/scope-filter-dialog/scope-filter-dialog.component';

interface CategoryStat {
  category: CategoryEnum;
  label: string;
  count: number;
}

interface SportGroup {
  sport: SportEnum;
  label: string;
  categories: CategoryStat[];
  subtotal: number;
}

interface BlockStat {
  block: BlockEnum;
  label: string;
  sportGroups: SportGroup[];
  showSportSubtotals: boolean;
  total: number;
  isPlantelSuperior: boolean;
}

const BLOCK_LABELS: Record<BlockEnum, string> = {
  [BlockEnum.INFANTILES]: 'Infantiles',
  [BlockEnum.CADETES]: 'Cadetes',
  [BlockEnum.JUVENILES]: 'Juveniles',
  [BlockEnum.MAYORES]: 'Mayores',
  [BlockEnum.PLANTEL_SUPERIOR]: 'Plantel Superior',
};

const RUGBY_CATS = new Set<CategoryEnum>([
  CategoryEnum.M5, CategoryEnum.M6, CategoryEnum.M7, CategoryEnum.M8,
  CategoryEnum.M9, CategoryEnum.M10, CategoryEnum.M11, CategoryEnum.M12,
  CategoryEnum.M13, CategoryEnum.M14, CategoryEnum.M15, CategoryEnum.M16,
  CategoryEnum.M17, CategoryEnum.M19,
]);

const HOCKEY_CATS = new Set<CategoryEnum>([
  CategoryEnum.PRE_DECIMA, CategoryEnum.DECIMA, CategoryEnum.NOVENA,
  CategoryEnum.OCTAVA, CategoryEnum.SEPTIMA, CategoryEnum.SEXTA,
  CategoryEnum.QUINTA, CategoryEnum.CUARTA, CategoryEnum.MASTER,
]);

@Component({
  selector: 'ltrc-player-stats-widget',
  standalone: true,
  imports: [MatProgressBarModule, MatIconModule, MatButtonModule],
  templateUrl: './player-stats-widget.component.html',
  styleUrl: './player-stats-widget.component.scss',
})
export class PlayerStatsWidgetComponent implements OnInit {
  private readonly playersService = inject(PlayersService);
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
  blocks: BlockStat[] = [];
  total = 0;

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
    this.playersService.getStats().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (stats) => {
        const allowedCategories = this.filterContext?.forcedCategory
          ? [this.filterContext.forcedCategory]
          : (this.filterContext?.categoryOptions.map((c) => c.id) ?? undefined);
        const effectiveCategories = this.selected.category
          ? [this.selected.category as CategoryEnum]
          : allowedCategories?.length ? allowedCategories as CategoryEnum[] : undefined;
        const effectiveSport = this.selected.sport ?? this.filterContext?.forcedSport;
        this.total = stats.total;
        this.blocks = this.buildBlocks(stats.byCategory, effectiveCategories, effectiveSport);
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  private buildBlocks(
    byCategory: Record<string, number>,
    allowedCategories?: CategoryEnum[],
    sport?: SportEnum,
  ): BlockStat[] {
    const result: BlockStat[] = [];

    const rugbyPs = byCategory['plantel_superior:rugby'];
    const hockeyPs = byCategory['plantel_superior:hockey'];
    if (!allowedCategories?.length || allowedCategories.includes(CategoryEnum.PLANTEL_SUPERIOR)) {
      const sportGroups: SportGroup[] = [];
      if (rugbyPs && (!sport || sport === SportEnum.RUGBY)) sportGroups.push({ sport: SportEnum.RUGBY, label: 'Rugby', categories: [], subtotal: rugbyPs });
      if (hockeyPs && (!sport || sport === SportEnum.HOCKEY)) sportGroups.push({ sport: SportEnum.HOCKEY, label: 'Hockey', categories: [], subtotal: hockeyPs });
      if (sportGroups.length) {
        result.push({
          block: BlockEnum.PLANTEL_SUPERIOR,
          label: BLOCK_LABELS[BlockEnum.PLANTEL_SUPERIOR],
          sportGroups,
          showSportSubtotals: false,
          total: sportGroups.reduce((s, g) => s + g.subtotal, 0),
          isPlantelSuperior: true,
        });
      }
    }

    for (const block of [BlockEnum.INFANTILES, BlockEnum.CADETES, BlockEnum.JUVENILES, BlockEnum.MAYORES]) {
      const cats = getBlockCategories(block).filter((cat) => {
        if (sport === SportEnum.RUGBY && !RUGBY_CATS.has(cat)) return false;
        if (sport === SportEnum.HOCKEY && !HOCKEY_CATS.has(cat)) return false;
        if (allowedCategories?.length) return allowedCategories.includes(cat);
        return byCategory[cat] !== undefined;
      });
      if (!cats.length) continue;

      const toStat = (c: CategoryEnum): CategoryStat => ({
        category: c,
        label: getCategoryLabel(c),
        count: byCategory[c] ?? 0,
      });

      const rugbyCats = cats.filter((c) => RUGBY_CATS.has(c)).map(toStat);
      const hockeyCats = cats.filter((c) => HOCKEY_CATS.has(c)).map(toStat);

      const sportGroups: SportGroup[] = [];
      if (rugbyCats.length) sportGroups.push({ sport: SportEnum.RUGBY, label: 'Rugby', categories: rugbyCats, subtotal: rugbyCats.reduce((s, c) => s + c.count, 0) });
      if (hockeyCats.length) sportGroups.push({ sport: SportEnum.HOCKEY, label: 'Hockey', categories: hockeyCats, subtotal: hockeyCats.reduce((s, c) => s + c.count, 0) });

      result.push({
        block,
        label: BLOCK_LABELS[block],
        sportGroups,
        showSportSubtotals: sportGroups.length > 1,
        total: sportGroups.reduce((s, g) => s + g.subtotal, 0),
        isPlantelSuperior: false,
      });
    }

    return result;
  }
}
