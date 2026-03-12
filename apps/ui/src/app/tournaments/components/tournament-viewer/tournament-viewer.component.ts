import {
  Component,
  HostListener,
  inject,
  OnInit,
  DestroyRef,
} from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { TournamentsService } from '../../services/tournaments.service';
import {
  CategoryEnum,
  RoleEnum,
  SportEnum,
  Tournament,
} from '@ltrc-ps/shared-api-model';
import { AllowedRolesDirective } from '../../../auth/directives/allowed-roles.directive';
import { MatCardModule } from '@angular/material/card';
import { MatChipsModule } from '@angular/material/chips';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { DatePipe } from '@angular/common';
import { sportOptions } from '../../../common/sport-options';
import { getCategoryLabel } from '../../../common/category-options';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

@Component({
  selector: 'ltrc-tournament-viewer',
  standalone: true,
  imports: [
    MatCardModule,
    MatChipsModule,
    MatButtonModule,
    MatIconModule,
    DatePipe,
    AllowedRolesDirective,
  ],
  templateUrl: './tournament-viewer.component.html',
  styleUrl: './tournament-viewer.component.scss',
})
export class TournamentViewerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly tournamentsService = inject(TournamentsService);
  private readonly destroyRef = inject(DestroyRef);

  tournament?: Tournament;
  readonly RoleEnum = RoleEnum;

  getSportLabel(sport?: SportEnum): string {
    return sportOptions.find((s) => s.id === sport)?.label ?? '';
  }

  getCategoryLabel(id: CategoryEnum): string {
    return getCategoryLabel(id);
  }

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
    this.router.navigate([
      '/dashboard/tournaments',
      this.tournament!.id,
      'edit',
    ]);
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.backToList();
  }

  backToList(): void {
    this.router.navigate(['/dashboard/tournaments']);
  }
}
