import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { Router, ActivatedRoute } from '@angular/router';
import { PlayersService } from '../../services/players.service';
import { Player } from '@ltrc-ps/shared-api-model';
import { PlayerFormComponent } from '../player-form/player-form.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ltrc-player-editor',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    PlayerFormComponent
  ],
  templateUrl: './player-editor.component.html',
  styleUrl: './player-editor.component.scss',
})
export class PlayerEditorComponent implements OnInit {
  private router = inject(Router);
  private playersService = inject(PlayersService);
  private route = inject(ActivatedRoute);
  private destroyRef = inject(DestroyRef);

  player?: Player;
  editing = false;
  submitting = false;

  ngOnInit() {
    // Tomar siempre el id de la ruta (ruta hija o ruta padre) para la edición.
    const id = this.route.snapshot.paramMap.get('id') ?? this.route.parent?.snapshot.paramMap.get('id');
    this.editing = !!id;

    if (this.editing && id) {
      // Cargar el player directamente desde la API usando el id de la ruta (nueva request).
      this.playersService.getPlayerById(id).pipe(takeUntilDestroyed(this.destroyRef)).subscribe((player: Player) => {
        this.player = player;
      });
    }
  }

  onFormSubmit(payload: Partial<Player>) {
    this.submitting = true;

    if (this.editing && this.player && this.player.id) {
      this.playersService.updatePlayer(this.player.id, payload).subscribe({
        next: (updated) => {
          this.submitting = false;
          this.router.navigate(['/players', updated.id]);
        },
        error: () => (this.submitting = false),
      });
      return;
    }

    // Crear
    this.playersService.createPlayer(payload as any).subscribe({
      next: (created) => {
        this.submitting = false;
        this.router.navigate(['/players', created.id]);
      },
      error: () => (this.submitting = false),
    });
  }
}
