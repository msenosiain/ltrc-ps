import { Component, DestroyRef, OnInit, inject, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Player, PlayerAvailabilityEnum, PlayerStatusEnum } from '@ltrc-campo/shared-api-model';
import { PlayersService } from '../../services/players.service';
import { UserFilterContextService, FilterContext } from '../../../common/services/user-filter-context.service';
import { getCategoryLabel } from '../../../common/category-options';

@Component({
  selector: 'ltrc-injured-players-widget',
  standalone: true,
  imports: [MatIconModule, MatProgressBarModule],
  templateUrl: './injured-players-widget.component.html',
  styleUrl: './injured-players-widget.component.scss',
})
export class InjuredPlayersWidgetComponent implements OnInit {
  private readonly playersService = inject(PlayersService);
  private readonly filterContextService = inject(UserFilterContextService);
  private readonly router = inject(Router);
  private readonly destroyRef = inject(DestroyRef);

  loading = true;
  players: Player[] = [];

  ngOnInit(): void {
    this.filterContextService.filterContext$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ctx) => this.load(ctx));
  }

  private load(ctx: FilterContext): void {
    this.loading = true;
    const filters: Record<string, unknown> = {
      availability: PlayerAvailabilityEnum.INJURED,
      status: PlayerStatusEnum.ACTIVE,
    };
    if (ctx.forcedSport) filters['sport'] = ctx.forcedSport;
    if (ctx.forcedCategory) filters['category'] = ctx.forcedCategory;

    this.playersService
      .getPlayers({ page: 1, size: 20, filters })
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (res) => {
          this.players = res.items;
          this.loading = false;
        },
        error: () => {
          this.players = [];
          this.loading = false;
        },
      });
  }

  getCategoryLabel(category?: string): string {
    return category ? getCategoryLabel(category as any) : '';
  }

  navigate(playerId: string): void {
    this.router.navigate(['/dashboard/players', playerId]);
  }

  goToPlayers(): void {
    this.router.navigate(['/dashboard/players']);
  }
}
