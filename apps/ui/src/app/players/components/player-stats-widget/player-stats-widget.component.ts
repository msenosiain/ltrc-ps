import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import { BlockEnum, CategoryEnum, getBlockCategories } from '@ltrc-campo/shared-api-model';
import { PlayersService } from '../../services/players.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getCategoryLabel } from '../../../common/category-options';

interface CategoryStat {
  category: CategoryEnum;
  label: string;
  count: number;
}

interface BlockStat {
  block: BlockEnum;
  label: string;
  categories: CategoryStat[];
  total: number;
}

const BLOCK_LABELS: Record<BlockEnum, string> = {
  [BlockEnum.INFANTILES]: 'Infantiles',
  [BlockEnum.CADETES]: 'Cadetes',
  [BlockEnum.JUVENILES]: 'Juveniles',
  [BlockEnum.PLANTEL_SUPERIOR]: 'Plantel Superior',
};

@Component({
  selector: 'ltrc-player-stats-widget',
  standalone: true,
  imports: [MatProgressBarModule, MatIconModule],
  templateUrl: './player-stats-widget.component.html',
  styleUrl: './player-stats-widget.component.scss',
})
export class PlayerStatsWidgetComponent implements OnInit {
  private readonly playersService = inject(PlayersService);
  private readonly destroyRef = inject(DestroyRef);

  loading = true;
  blocks: BlockStat[] = [];
  total = 0;

  ngOnInit(): void {
    this.playersService.getStats().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (stats) => {
        this.total = stats.total;
        this.blocks = this.buildBlocks(stats.byCategory);
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  private buildBlocks(byCategory: Record<string, number>): BlockStat[] {
    const result: BlockStat[] = [];
    for (const block of Object.values(BlockEnum)) {
      const cats = getBlockCategories(block)
        .filter((cat) => byCategory[cat] !== undefined)
        .map((cat) => ({
          category: cat,
          label: getCategoryLabel(cat),
          count: byCategory[cat] ?? 0,
        }));
      if (!cats.length) continue;
      result.push({
        block,
        label: BLOCK_LABELS[block],
        categories: cats,
        total: cats.reduce((s, c) => s + c.count, 0),
      });
    }
    return result;
  }
}
