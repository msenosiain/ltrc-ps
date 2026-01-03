import { Component, inject } from '@angular/core';
import {
  MatDialogRef,
  MAT_DIALOG_DATA,
  MatDialogModule,
} from '@angular/material/dialog';
import { PlayerFormComponent } from '../player-form/player-form.component';
import { CommonModule } from '@angular/common';
import { PlayersService } from '../../services/players.service';
import { Player } from '@ltrc-ps/shared-api-model';
import { Inject } from '@angular/core';

@Component({
  selector: 'ltrc-player-modal',
  standalone: true,
  imports: [CommonModule, MatDialogModule, PlayerFormComponent],
  templateUrl: 'player-modal.component.html',
})
export class PlayerModalComponent {
  private playersService = inject(PlayersService);
  private dialogRef = inject(MatDialogRef<PlayerModalComponent>);
  @Inject(MAT_DIALOG_DATA) public readonly player!: Player;

  submitting = false;

  onSubmit(formValue: Partial<Player>) {
    this.submitting = true;

    const request$ = this.player
      ? this.playersService.updatePlayer(this.player.id, formValue)
      : this.playersService.createPlayer(formValue);

    request$.subscribe({
      next: (res) => {
        this.submitting = false;
        this.dialogRef.close(res); // devolvemos el jugador creado/actualizado
      },
      error: () => {
        this.submitting = false;
      },
    });
  }
}
