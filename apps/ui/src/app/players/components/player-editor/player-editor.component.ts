import {
  Component,
  HostListener,
  inject,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { PlayersService } from '../../services/players.service';
import { Player } from '@ltrc-ps/shared-api-model';
import {
  PlayerFormComponent,
  PlayerFormSubmitEvent,
} from '../player-form/player-form.component';
import { ConfirmDialogComponent } from '../../../common/components/confirm-dialog/confirm-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { getErrorMessage } from '../../../common/utils/error-message';

@Component({
  selector: 'ltrc-player-editor',
  standalone: true,
  imports: [
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    PlayerFormComponent,
  ],
  templateUrl: './player-editor.component.html',
  styleUrl: './player-editor.component.scss',
})
export class PlayerEditorComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly playersService = inject(PlayersService);
  private readonly dialog = inject(MatDialog);
  private readonly snackBar = inject(MatSnackBar);
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

    const onError = (err: unknown) => {
      this.submitting = false;
      this.snackBar.open(getErrorMessage(err, 'Error al guardar el jugador'), 'Cerrar', { duration: 5000 });
    };

    if (this.editing && this.player?.id) {
      const obs = file
        ? this.playersService.updatePlayerWithPhoto(
            this.player.id,
            payload,
            file
          )
        : this.playersService.updatePlayer(this.player.id, payload);
      obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/dashboard/players']);
        },
        error: onError,
      });
      return;
    }

    const obs = file
      ? this.playersService.createPlayerWithPhoto(payload, file)
      : this.playersService.createPlayer(payload);
    obs.pipe(takeUntilDestroyed(this.destroyRef)).subscribe({
      next: () => {
        this.submitting = false;
        this.router.navigate(['/dashboard/players']);
      },
      error: onError,
    });
  }

  onDelete(): void {
    const name = this.player?.name ?? '';
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: {
        title: 'Eliminar jugador',
        message: `¿Estás seguro que querés eliminar a ${name}? Esta acción no se puede deshacer.`,
        confirmLabel: 'Eliminar',
      },
    });

    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.playersService
          .deletePlayer(this.player!.id!)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.router.navigate(['/dashboard/players']));
      });
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    if (this.dialog.openDialogs.length > 0) return;
    this.onCancel();
  }

  onCancel(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}
