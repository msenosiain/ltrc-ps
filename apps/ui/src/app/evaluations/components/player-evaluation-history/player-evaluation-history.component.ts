import { Component, OnInit, inject, DestroyRef, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatExpansionModule } from '@angular/material/expansion';
import { DecimalPipe } from '@angular/common';
import {
  EvaluationSkillEnum,
  PlayerEvaluation,
} from '@ltrc-campo/shared-api-model';
import { EvaluationsService } from '../../services/evaluations.service';

const SKILL_LABELS: Record<EvaluationSkillEnum, string> = {
  [EvaluationSkillEnum.TACKLE]: 'Tackle',
  [EvaluationSkillEnum.PASE]: 'Pase',
  [EvaluationSkillEnum.PATADA]: 'Patada',
  [EvaluationSkillEnum.JUEGO]: 'Juego',
  [EvaluationSkillEnum.FISICO]: 'Físico',
};

@Component({
  selector: 'ltrc-player-evaluation-history',
  standalone: true,
  imports: [
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatExpansionModule,
    DecimalPipe,
  ],
  templateUrl: './player-evaluation-history.component.html',
  styleUrl: './player-evaluation-history.component.scss',
})
export class PlayerEvaluationHistoryComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly evaluationsService = inject(EvaluationsService);
  private readonly destroyRef = inject(DestroyRef);

  evaluations: PlayerEvaluation[] = [];
  loading = signal(false);
  readonly skillLabels = SKILL_LABELS;
  readonly skills = Object.values(EvaluationSkillEnum);

  ngOnInit(): void {
    const playerId = this.route.snapshot.paramMap.get('playerId');
    if (!playerId) { this.goBack(); return; }
    this.loading.set(true);
    this.evaluationsService
      .getByPlayer(playerId)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (data) => { this.evaluations = data; this.loading.set(false); },
        error: () => { this.loading.set(false); },
      });
  }

  formatPeriod(period: string): string {
    const [year, month] = period.split('-');
    const d = new Date(Number(year), Number(month) - 1, 1);
    return d.toLocaleDateString('es-AR', { month: 'long', year: 'numeric' });
  }

  getPlayerName(): string {
    const p = this.evaluations[0]?.player as any;
    if (!p) return '';
    return p.name ?? p.nickName ?? '';
  }

  goBack(): void {
    this.router.navigate(['/dashboard/evaluations']);
  }
}
