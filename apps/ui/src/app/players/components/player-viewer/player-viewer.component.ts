import { Component, HostListener, inject, OnInit, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayersService } from '../../services/players.service';
import { CategoryEnum, Player, PlayerPosition } from '@ltrc-ps/shared-api-model';
import { categoryOptions } from '../../../common/category-options';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { AllowedRolesDirective } from '../../../auth/directives/allowed-roles.directive';
import { Role } from '../../../auth/roles.enum';

@Component({
  selector: 'ltrc-player-viewer',
  standalone: true,
  imports: [
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    DatePipe,
    AllowedRolesDirective,
  ],
  templateUrl: './player-viewer.component.html',
  styleUrl: './player-viewer.component.scss',
})
export class PlayerViewerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly playersService = inject(PlayersService);
  private readonly destroyRef = inject(DestroyRef);

  Role = Role;
  player?: Player;

  ngOnInit(): void {
    const playerId = this.route.snapshot.paramMap.get('id');

    if (!playerId) {
      this.router.navigate(['/players']);
      return;
    }

    this.playersService
      .getPlayerById(playerId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (player) => (this.player = player),
        error: () => this.router.navigate(['/players']),
      });
  }

  edit(): void {
    this.router.navigate(['/dashboard/players', this.player!.id, 'edit']);
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.backToList();
  }

  backToList(): void {
    this.router.navigate(['/dashboard/players']);
  }

  getPlayerPhotoUrl(playerId?: string): string {
    return playerId
      ? this.playersService.getPlayerPhotoUrl(playerId)
      : '/placeholder.jpg';
  }

  getCategoryLabel(category?: CategoryEnum): string {
    if (!category) return '';
    return categoryOptions.find((c) => c.id === category)?.label ?? category;
  }

  getPositionLabel(position: PlayerPosition): string {
    return this.playersService.getPositionLabel(position);
  }

  getPlayerAge(birthDate: Date): number {
    return this.playersService.calculatePlayerAge(birthDate);
  }
}
