import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayersService } from '../../services/players.service';
import {
  getPlayerPhotoUrl,
  Player,
  PlayerPositionEnum,
} from '@ltrc-ps/shared-api-model';
import { MatCard } from '@angular/material/card';
import { MatChip } from '@angular/material/chips';
import { MatButton } from '@angular/material/button';
import { MatTab, MatTabGroup } from '@angular/material/tabs';

@Component({
  selector: 'ltrc-player-detail',
  imports: [MatCard, MatChip, MatButton, MatTabGroup, MatTab],
  templateUrl: './player-detail.component.html',
  styleUrl: './player-detail.component.scss',
})
export class PlayerDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private playersService = inject(PlayersService);

  protected readonly getPlayerPhotoUrl = getPlayerPhotoUrl;

  player?: Player;
  loading = true;

  ngOnInit() {
    const playerId = this.route.snapshot.paramMap.get('id');

    if (!playerId) {
      this.router.navigate(['/players']);
      return;
    }

    this.playersService.getPlayerById(playerId).subscribe({
      next: (player) => {
        this.player = player;
        this.loading = false;
      },
      error: () => {
        // manejar 404 u otros errores
        this.router.navigate(['/players']);
      },
    });
  }

  edit() {
    this.router.navigate(['edit'], { relativeTo: this.route });
  }

  delete() {
    if (!this.player) return;

    if (confirm('¿Eliminar jugador?')) {
      this.playersService.deletePlayer(this.player.id).subscribe(() => {
        this.router.navigate(['/players']);
      });
    }
  }

  getPositionLabel(position: PlayerPositionEnum): string {
    return this.playersService.getPositionLabel(position);
  }
}
