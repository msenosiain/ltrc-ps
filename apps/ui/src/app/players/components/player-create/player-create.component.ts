import { Component, inject } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { Router } from '@angular/router';
import { PlayersService } from '../../services/players.service';
import {
  ClothingSizesEnum,
  Player,
  PlayerPositionEnum,
} from '@ltrc-ps/shared-api-model';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { buildCreatePlayerForm } from '../../forms/player-form.factory';
import { PlayerFormValue } from '../../forms/player-form.types';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSelectModule } from '@angular/material/select';
import { PositionOption, positionOptions } from '../../position-options';

@Component({
  selector: 'ltrc-player-edit',
  imports: [
    MatCardModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatSelectModule,
  ],
  templateUrl: './player-create.component.html',
  styleUrl: './player-create.component.scss',
})
export class PlayerCreateComponent {
  private router = inject(Router);
  private playersService = inject(PlayersService);
  private fb = inject(FormBuilder);

  player?: Player;
  form = buildCreatePlayerForm(this.fb);

  positionOptions: PositionOption[] = positionOptions;
  clothingSizesOptions = Object.values(ClothingSizesEnum);

  getPlayerPhotoUrl(playerId: string) {
    return this.playersService.getPlayerPhotoUrl(playerId);
  }

  getPositionLabel(position: PlayerPositionEnum): string {
    return this.playersService.getPositionLabel(position);
  }

  submit() {
    if (this.form.invalid) return;

    const playerFormValue = this.form.getRawValue() as PlayerFormValue;

    this.playersService.createPlayer(playerFormValue).subscribe();
  }

  cancel() {
    this.router.navigate(['/players', this.player?.id]);
  }

  backToList() {
    this.router.navigate(['/players']);
  }
}
