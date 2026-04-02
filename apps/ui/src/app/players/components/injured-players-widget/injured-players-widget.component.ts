import { Component, DestroyRef, OnInit, inject } from '@angular/core';
import { Router } from '@angular/router';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatDialog } from '@angular/material/dialog';
import { Player, PlayerAvailabilityEnum, PlayerStatusEnum } from '@ltrc-campo/shared-api-model';
import { PlayersService } from '../../services/players.service';
import { UserFilterContextService, FilterContext } from '../../../common/services/user-filter-context.service';
import { getCategoryLabel } from '../../../common/category-options';
import {
  ScopeFilterDialogComponent,
  ScopeFilterDialogData,
  ScopeFilterSelection,
} from '../../../common/components/scope-filter-dialog/scope-filter-dialog.component';

@Component({
  selector: 'ltrc-injured-players-widget',
  standalone: true,
  imports: [MatIconModule, MatProgressBarModule, MatButtonModule],
  templateUrl: './injured-players-widget.component.html',
  styleUrl: './injured-players-widget.component.scss',
})
export class InjuredPlayersWidgetComponent implements OnInit {
  private readonly playersService = inject(PlayersService);
  private readonly filterContextService = inject(UserFilterContextService);
  private readonly dialog = inject(MatDialog);
  private readonly router = inject(Router);
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
  players: Player[] = [];

  ngOnInit(): void {
    this.filterContextService.filterContext$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ctx) => {
        this.filterContext = ctx;
        if (ctx.forcedSport) this.selected = { ...this.selected, sport: ctx.forcedSport };
        if (ctx.forcedCategory) this.selected = { ...this.selected, category: ctx.forcedCategory };
        this.load();
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
      this.load();
    });
  }

  private load(): void {
    this.loading = true;
    const filters: Record<string, unknown> = {
      availability: PlayerAvailabilityEnum.INJURED,
      status: PlayerStatusEnum.ACTIVE,
    };
    if (this.selected.sport) filters['sport'] = this.selected.sport;
    else if (this.filterContext?.forcedSport) filters['sport'] = this.filterContext.forcedSport;
    if (this.selected.category) filters['category'] = this.selected.category;
    else if (this.filterContext?.forcedCategory) filters['category'] = this.filterContext.forcedCategory;

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
