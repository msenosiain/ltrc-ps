import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { Router, ActivatedRoute } from '@angular/router';
import { TournamentsService, TournamentFormValue } from '../../services/tournaments.service';
import { Tournament } from '@ltrc-ps/shared-api-model';
import { TournamentFormComponent } from '../tournament-form/tournament-form.component';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ltrc-tournament-editor',
  standalone: true,
  imports: [MatProgressBarModule, TournamentFormComponent],
  templateUrl: './tournament-editor.component.html',
  styleUrl: './tournament-editor.component.scss',
})
export class TournamentEditorComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly tournamentsService = inject(TournamentsService);
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

    const onSuccess = (t: Tournament) => {
      this.submitting = false;
      this.router.navigate(['/dashboard/tournaments', t.id]);
    };

    const onError = () => (this.submitting = false);

    if (this.editing && this.tournament?.id) {
      this.tournamentsService
        .updateTournament(this.tournament.id, payload)
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe({ next: onSuccess, error: onError });
      return;
    }

    this.tournamentsService
      .createTournament(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({ next: onSuccess, error: onError });
  }

  onCancel(): void {
    this.router.navigate(['..'], { relativeTo: this.route });
  }
}