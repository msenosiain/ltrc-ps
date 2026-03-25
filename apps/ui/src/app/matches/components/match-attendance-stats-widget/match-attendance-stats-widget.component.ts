import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { BlockEnum, CategoryEnum, getBlockCategories } from '@ltrc-campo/shared-api-model';
import { MatchesService } from '../../services/matches.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getCategoryLabel } from '../../../common/category-options';

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
  imports: [MatProgressBarModule],
  templateUrl: './match-attendance-stats-widget.component.html',
  styleUrl: './match-attendance-stats-widget.component.scss',
})
export class MatchAttendanceStatsWidgetComponent implements OnInit {
  private readonly matchesService = inject(MatchesService);
  private readonly destroyRef = inject(DestroyRef);

  loading = true;
  blocks: BlockAttStat[] = [];

  ngOnInit(): void {
    this.matchesService.getAttendanceStats().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
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
