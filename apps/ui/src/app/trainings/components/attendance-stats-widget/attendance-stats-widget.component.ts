import { Component, inject, OnInit, DestroyRef, signal, computed } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { FormsModule } from '@angular/forms';
import { BlockEnum, CategoryEnum, SportEnum, getBlockCategories } from '@ltrc-campo/shared-api-model';
import { TrainingSessionsService } from '../../services/training-sessions.service';
import { UserFilterContextService, FilterContext } from '../../../common/services/user-filter-context.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { getCategoryLabel, getCategoryOptionsBySport } from '../../../common/category-options';
import { SportOption } from '../../../common/sport-options';
import { CategoryOption } from '../../../common/category-options';

interface CategoryAttStat {
  category: CategoryEnum;
  label: string;
  sessions: number;
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
  selector: 'ltrc-attendance-stats-widget',
  standalone: true,
  imports: [MatProgressBarModule, MatFormFieldModule, MatSelectModule, FormsModule],
  templateUrl: './attendance-stats-widget.component.html',
  styleUrl: './attendance-stats-widget.component.scss',
})
export class AttendanceStatsWidgetComponent implements OnInit {
  private readonly sessionsService = inject(TrainingSessionsService);
  private readonly filterContextService = inject(UserFilterContextService);
  private readonly destroyRef = inject(DestroyRef);

  private filterContext = signal<FilterContext | null>(null);

  readonly selectedSport = signal<SportEnum | undefined>(undefined);
  readonly selectedCategory = signal<CategoryEnum | undefined>(undefined);

  readonly showSportFilter = computed(() => {
    const ctx = this.filterContext();
    return !!ctx && ctx.sportOptions.length > 1;
  });

  readonly sportOptions = computed<SportOption[]>(() => this.filterContext()?.sportOptions ?? []);

  readonly showCategoryFilter = computed(() => {
    const ctx = this.filterContext();
    if (!ctx) return false;
    return this.availableCategoryOptions().length > 1;
  });

  readonly availableCategoryOptions = computed<CategoryOption[]>(() => {
    const ctx = this.filterContext();
    if (!ctx) return [];

    const sport = this.selectedSport() ?? ctx.forcedSport;

    // Start from user's allowed categories
    let options = ctx.categoryOptions;

    // Further filter by selected sport
    if (sport) {
      const sportCats = getCategoryOptionsBySport(sport).map((c) => c.id);
      options = options.filter((c) => sportCats.includes(c.id));
    }

    return options;
  });

  loading = true;
  blocks: BlockAttStat[] = [];

  ngOnInit(): void {
    this.filterContextService.filterContext$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ctx) => {
        this.filterContext.set(ctx);
        // Auto-apply forced values
        if (ctx.forcedSport) this.selectedSport.set(ctx.forcedSport);
        if (ctx.forcedCategory) this.selectedCategory.set(ctx.forcedCategory);
        this.loadStats();
      });
  }

  onSportChange(): void {
    // Reset category when sport changes
    this.selectedCategory.set(undefined);
    this.loadStats();
  }

  onCategoryChange(): void {
    this.loadStats();
  }

  private loadStats(): void {
    const ctx = this.filterContext();
    const sport = this.selectedSport() ?? ctx?.forcedSport;
    const category = this.selectedCategory() ?? ctx?.forcedCategory;

    this.loading = true;
    this.sessionsService
      .getAttendanceStats({
        sport: sport as string | undefined,
        category: category as string | undefined,
      })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (stats) => {
          this.blocks = this.buildBlocks(stats.byCategory);
          this.loading = false;
        },
        error: () => { this.loading = false; },
      });
  }

  private buildBlocks(byCategory: Record<string, { sessions: number; pct: number }>): BlockAttStat[] {
    const result: BlockAttStat[] = [];
    for (const block of Object.values(BlockEnum)) {
      const cats = getBlockCategories(block)
        .filter((cat) => byCategory[cat] !== undefined)
        .map((cat) => ({
          category: cat,
          label: getCategoryLabel(cat),
          sessions: byCategory[cat].sessions,
          pct: byCategory[cat].pct,
        }));
      if (!cats.length) continue;
      const avgPct = Math.round(cats.reduce((s, c) => s + c.pct, 0) / cats.length);
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
