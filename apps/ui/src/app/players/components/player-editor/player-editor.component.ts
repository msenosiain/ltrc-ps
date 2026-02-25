import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { MatCardModule } from '@angular/material/card';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { PlayersService } from '../../services/players.service';
import { Player } from '@ltrc-ps/shared-api-model';
import {
  PlayerFormComponent,
  PlayerFormSubmitEvent,
} from '../player-form/player-form.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ltrc-player-editor',
  standalone: true,
  imports: [MatCardModule, MatProgressBarModule, PlayerFormComponent],
  templateUrl: './player-editor.component.html',
  styleUrl: './player-editor.component.scss',
})
export class PlayerEditorComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly playersService = inject(PlayersService);
  private readonly destroyRef = inject(DestroyRef);

  player?: Player;
  editing = false;
  submitting = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.editing = !!id;

    if (id) {
      this.playersService
        .getPlayerById(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((player) => (this.player = player));
    }
  }

  onFormSubmitWithPhoto({ payload, file }: PlayerFormSubmitEvent): void {
    this.submitting = true;

    const onSuccess = (p: Player) => {
      this.submitting = false;
      this.router.navigate(['/dashboard/players', p.id]);
    };

    const onError = () => (this.submitting = false);

    if (this.editing && this.player?.id) {
      const obs = file
        ? this.playersService.updatePlayerWithPhoto(
            this.player.id,
            payload,
            file
          )
        : this.playersService.updatePlayer(this.player.id, payload);
      obs
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ next: onSuccess, error: onError });
      return;
    }

    const obs = file
      ? this.playersService.createPlayerWithPhoto(payload, file)
      : this.playersService.createPlayer(payload);
    obs
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: onSuccess, error: onError });
  }

  onCancel(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
