import { Component, HostListener, inject, OnInit, DestroyRef } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatchesService } from '../../services/matches.service';
import { CategoryEnum, Match, MatchStatusEnum, MatchTypeEnum, Tournament } from '@ltrc-ps/shared-api-model';
import { matchCategoryOptions } from '../../match-options';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { DatePipe } from '@angular/common';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatchSquadComponent } from '../match-squad/match-squad.component';

@Component({
  selector: 'ltrc-match-viewer',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatChipsModule, DatePipe, MatchSquadComponent],
  templateUrl: './match-viewer.component.html',
  styleUrl: './match-viewer.component.scss',
})
export class MatchViewerComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly matchesService = inject(MatchesService);
  private readonly destroyRef = inject(DestroyRef);

  match?: Match;
  readonly MatchStatusEnum = MatchStatusEnum;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.router.navigate(['/dashboard/matches']);
      return;
    }

    this.matchesService
      .getMatchById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (match) => (this.match = match),
        error: () => this.router.navigate(['/dashboard/matches']),
      });
  }

  get tournamentName(): string | undefined {
    return (this.match?.tournament as Tournament)?.name;
  }

  getStatusLabel(status: MatchStatusEnum): string {
    return this.matchesService.getStatusLabel(status);
  }

  getTypeLabel(type: MatchTypeEnum): string {
    return this.matchesService.getTypeLabel(type);
  }

  getCategoryLabel(category?: CategoryEnum): string {
    if (!category) return '';
    return matchCategoryOptions.find((c) => c.id === category)?.label ?? category;
  }

  edit(): void {
    this.router.navigate(['/dashboard/matches', this.match!.id, 'edit']);
  }

  @HostListener('document:keydown.escape')
  onEscapeKey(): void {
    this.backToList();
  }

  backToList(): void {
    this.router.navigate(['/dashboard/matches']);
  }
}