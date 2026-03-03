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
import { Router, ActivatedRoute } from '@angular/router';
import {
  TournamentsService,
  TournamentFormValue,
} from '../../services/tournaments.service';
import { Tournament } from '@ltrc-ps/shared-api-model';
import { TournamentFormComponent } from '../tournament-form/tournament-form.component';
import { ConfirmDialogComponent } from '../../../common/components/confirm-dialog/confirm-dialog.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ltrc-tournament-editor',
  standalone: true,
  imports: [
    MatProgressBarModule,
    MatButtonModule,
    MatIconModule,
    TournamentFormComponent,
  ],
  templateUrl: './tournament-editor.component.html',
  styleUrl: './tournament-editor.component.scss',
})
export class TournamentEditorComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly tournamentsService = inject(TournamentsService);
  private readonly dialog = inject(MatDialog);
  private readonly destroyRef = inject(DestroyRef);

  tournament?: Tournament;
  editing = false;
  submitting = false;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    this.editing = !!id;

    if (id) {
      this.tournamentsService
        .getTournamentById(id)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((tournament) => (this.tournament = tournament));
    }
  }

  onFormSubmit(payload: TournamentFormValue): void {
    this.submitting = true;

    const onError = () => (this.submitting = false);

    if (this.editing && this.tournament?.id) {
      this.tournamentsService
        .updateTournament(this.tournament.id, payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({
          next: () => {
            this.submitting = false;
            this.router.navigate(['/dashboard/tournaments']);
          },
          error: onError,
        });
      return;
    }

    this.tournamentsService
      .createTournament(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          this.submitting = false;
          this.router.navigate(['/dashboard/tournaments']);
        },
        error: onError,
      });
  }

  onDelete(): void {
    const ref = this.dialog.open(ConfirmDialogComponent, {
      width: '380px',
      data: {
        title: 'Eliminar torneo',
        message: `¿Estás seguro que querés eliminar "${this.tournament?.name}"? Esta acción no se puede deshacer.`,
        confirmLabel: 'Eliminar',
      },
    });

    ref
      .afterClosed()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((confirmed) => {
        if (!confirmed) return;
        this.tournamentsService
          .deleteTournament(this.tournament!.id!)
          .pipe(takeUntilDestroyed(this.destroyRef))
          .subscribe(() => this.router.navigate(['/dashboard/tournaments']));
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
