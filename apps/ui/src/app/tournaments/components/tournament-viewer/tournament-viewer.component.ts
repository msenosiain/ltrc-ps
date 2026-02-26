import { Component, inject, OnInit, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TournamentsService } from '../../services/tournaments.service';
import { Tournament } from '@ltrc-ps/shared-api-model';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ltrc-tournament-viewer',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, DatePipe],
  templateUrl: './tournament-viewer.component.html',
  styleUrl: './tournament-viewer.component.scss',
})
export class TournamentViewerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tournamentsService = inject(TournamentsService);
  private readonly destroyRef = inject(DestroyRef);

  tournament?: Tournament;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');

    if (!id) {
      this.router.navigate(['/dashboard/tournaments']);
      return;
    }

    this.tournamentsService
      .getTournamentById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (tournament) => (this.tournament = tournament),
        error: () => this.router.navigate(['/dashboard/tournaments']),
      });
  }

  edit(): void {
    this.router.navigate(['/dashboard/tournaments', this.tournament!.id, 'edit']);
  }

  backToList(): void {
    this.router.navigate(['/dashboard/tournaments']);
  }
}
