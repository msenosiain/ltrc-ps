import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatIconModule } from '@angular/material/icon';
import {
  BlockEnum,
  CategoryEnum,
  SportEnum,
  getBlockCategories,
} from '@ltrc-campo/shared-api-model';
import { PlayersService } from '../../services/players.service';
import { AuthService } from '../../../auth/auth.service';
import { takeUntilDestroyed, toSignal } from '@angular/core/rxjs-interop';
import { getCategoryLabel } from '../../../common/category-options';

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
  imports: [MatProgressBarModule, MatIconModule],
  templateUrl: './player-stats-widget.component.html',
  styleUrl: './player-stats-widget.component.scss',
})
export class PlayerStatsWidgetComponent implements OnInit {
  private readonly playersService = inject(PlayersService);
  private readonly authService = inject(AuthService);
  private readonly destroyRef = inject(DestroyRef);
  private readonly currentUser = toSignal(this.authService.user$);

  loading = true;
  blocks: BlockStat[] = [];
  total = 0;

  ngOnInit(): void {
    this.playersService.getStats().pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (stats) => {
        const allowedCategories = this.currentUser()?.categories as CategoryEnum[] | undefined;
        this.total = stats.total;
        this.blocks = this.buildBlocks(stats.byCategory, allowedCategories);
        this.loading = false;
      },
      error: () => { this.loading = false; },
    });
  }

  private buildBlocks(
    byCategory: Record<string, number>,
    allowedCategories?: CategoryEnum[]
  ): BlockStat[] {
    const result: BlockStat[] = [];

    // Plantel Superior — one block with Rugby / Hockey sport rows
    const rugbyPs = byCategory['plantel_superior:rugby'];
    const hockeyPs = byCategory['plantel_superior:hockey'];
    if (!allowedCategories?.length || allowedCategories.includes(CategoryEnum.PLANTEL_SUPERIOR)) {
      const sportGroups: SportGroup[] = [];
      if (rugbyPs) sportGroups.push({ sport: SportEnum.RUGBY, label: 'Rugby', categories: [], subtotal: rugbyPs });
      if (hockeyPs) sportGroups.push({ sport: SportEnum.HOCKEY, label: 'Hockey', categories: [], subtotal: hockeyPs });
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

    // Other blocks
    for (const block of [BlockEnum.INFANTILES, BlockEnum.CADETES, BlockEnum.JUVENILES, BlockEnum.MAYORES]) {
      const cats = getBlockCategories(block).filter((cat) => {
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
