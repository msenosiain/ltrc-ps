import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { PlayersService } from '../../services/players.service';
import { Player, PlayerPositionEnum } from '@ltrc-ps/shared-api-model';
import { MatCard } from '@angular/material/card';
import { MatChip } from '@angular/material/chips';
import { MatButton } from '@angular/material/button';
import { MatTab, MatTabGroup } from '@angular/material/tabs';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ltrc-player-viewer',
  standalone: true,
  imports: [MatCard, MatChip, MatButton, MatTabGroup, MatTab, DatePipe],
  templateUrl: './player-viewer.component.html',
  styleUrl: './player-viewer.component.scss',
})
export class PlayerViewerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private playersService = inject(PlayersService);
  private destroyRef = inject(DestroyRef);

  player?: Player;

  ngOnInit() {
    const playerId = this.route.snapshot.paramMap.get('id');

    if (!playerId) {
      this.router.navigate(['/players']);
      return;
    }

    this.playersService.getPlayerById(playerId).pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: (player) => {
        this.player = player;
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

  // Eliminar: la acción de borrado se implementará en una tarea separada si es necesaria.

  getPlayerPhotoUrl(playerId?: string) {
    if (!playerId) {
      return '/placeholder.jpg';
    }
    return this.playersService.getPlayerPhotoUrl(playerId);
  }

  getPositionLabel(position: PlayerPositionEnum): string {
    return this.playersService.getPositionLabel(position);
  }

  getPlayerAge(birthDate: Date) {
    return this.playersService.calculatePlayerAge(birthDate);
  }

  backToList(){
    // Navegar relativo al padre para volver a la lista (dashboard -> players)
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
