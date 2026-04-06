import { Component, OnInit, inject, DestroyRef } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatSliderModule } from '@angular/material/slider';
import { MatChipsModule } from '@angular/material/chips';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { DecimalPipe } from '@angular/common';
import {
  AttendanceEntry,
  AttendanceStatusEnum,
  EvaluationLevelEnum,
  EvaluationSkillEnum,
  RUGBY_SKILL_CRITERIA,
  TrainingSession,
  scoreToLevel,
} from '@ltrc-campo/shared-api-model';
import { TrainingSessionsService } from '../../../trainings/services/training-sessions.service';
import { EvaluationsService, UpsertEvaluationPayload } from '../../services/evaluations.service';
import { getCategoryLabel } from '../../../common/category-options';

interface SubcriterionState {
  name: string;
  score: 0 | 1 | 2 | 3;
}

interface SkillState {
  skill: EvaluationSkillEnum;
  label: string;
  subcriteria: SubcriterionState[];
  total: number;
  level: EvaluationLevelEnum;
}

interface PlayerEvalState {
  playerId: string;
  playerName: string;
  skills: SkillState[];
  overallTotal: number;
  overallLevel: EvaluationLevelEnum;
  saving: boolean;
  saved: boolean;
  notes: string;
}

const SKILL_LABELS: Record<EvaluationSkillEnum, string> = {
  [EvaluationSkillEnum.TACKLE]: 'Tackle',
  [EvaluationSkillEnum.PASE]: 'Pase',
  [EvaluationSkillEnum.PATADA]: 'Patada',
  [EvaluationSkillEnum.JUEGO]: 'Juego',
  [EvaluationSkillEnum.FISICO]: 'Físico',
};

const SCORE_LABELS = ['Bajo', 'Aceptable', 'Buena', 'Muy buena'];

@Component({
  selector: 'ltrc-session-evaluate',
  standalone: true,
  imports: [
    FormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatSnackBarModule,
    MatSliderModule,
    MatChipsModule,
    MatExpansionModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    DecimalPipe,
  ],
  templateUrl: './session-evaluate.component.html',
  styleUrl: './session-evaluate.component.scss',
})
export class SessionEvaluateComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sessionsService = inject(TrainingSessionsService);
  private readonly evaluationsService = inject(EvaluationsService);
  private readonly snackBar = inject(MatSnackBar);
  private readonly destroyRef = inject(DestroyRef);

  session?: TrainingSession;
  players: PlayerEvalState[] = [];
  loading = false;
  period = '';

  readonly EvaluationLevelEnum = EvaluationLevelEnum;
  readonly SCORE_LABELS = SCORE_LABELS;

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.goBack();
      return;
    }

    // period = YYYY-MM from session date
    this.loading = true;
    this.sessionsService
      .getSessionById(id)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: (session) => {
          this.session = session;
          this.period = (session.date as unknown as string).substring(0, 7);
          this.players = this.buildPlayerStates(session);
          this.loading = false;
        },
        error: () => { this.loading = false; this.goBack(); },
      });
  }

  getCategoryLabel(): string {
    return getCategoryLabel(this.session?.category);
  }

  scoreLabel(score: number): string {
    return SCORE_LABELS[score] ?? '';
  }

  onScoreChange(player: PlayerEvalState, skill: SkillState): void {
    const avg = skill.subcriteria.reduce((s, c) => s + c.score, 0) / (skill.subcriteria.length || 1);
    skill.total = Math.round(avg * 100) / 100;
    skill.level = scoreToLevel(skill.total);
    this.recomputeOverall(player);
  }

  recomputeOverall(player: PlayerEvalState): void {
    const avg = player.skills.reduce((s, sk) => s + sk.total, 0) / (player.skills.length || 1);
    player.overallTotal = Math.round(avg * 100) / 100;
    player.overallLevel = scoreToLevel(player.overallTotal);
  }

  savePlayer(player: PlayerEvalState): void {
    if (!this.session) return;
    player.saving = true;

    const payload: UpsertEvaluationPayload = {
      playerId: player.playerId,
      category: this.session.category,
      sport: this.session.sport,
      period: this.period,
      date: this.session.date as unknown as string,
      skills: player.skills.map((sk) => ({
        skill: sk.skill,
        subcriteria: sk.subcriteria.map((c) => ({ name: c.name, score: c.score })),
      })),
      notes: player.notes || undefined,
    };

    this.evaluationsService
      .upsert(payload)
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe({
        next: () => {
          player.saving = false;
          player.saved = true;
          this.snackBar.open(`Evaluación de ${player.playerName} guardada`, 'Cerrar', { duration: 3000 });
        },
        error: () => {
          player.saving = false;
          this.snackBar.open('Error al guardar', 'Cerrar', { duration: 4000 });
        },
      });
  }

  goBack(): void {
    this.router.navigate(['/dashboard/trainings/sessions', this.session?.id ?? '']);
  }

  private buildPlayerStates(session: TrainingSession): PlayerEvalState[] {
    const presentPlayers = (session.attendance ?? []).filter(
      (a) => !a.isStaff && a.status === AttendanceStatusEnum.PRESENT && a.player
    );

    return presentPlayers.map((entry) => {
      const p = entry.player as any;
      const skills = Object.values(EvaluationSkillEnum).map((skill) => ({
        skill,
        label: SKILL_LABELS[skill],
        subcriteria: (RUGBY_SKILL_CRITERIA[skill] ?? []).map((name) => ({
          name,
          score: 0 as 0 | 1 | 2 | 3,
        })),
        total: 0,
        level: EvaluationLevelEnum.EVALUAR,
      }));

      return {
        playerId: p?.id ?? p?._id ?? '',
        playerName: p?.name ?? p?.nickName ?? '—',
        skills,
        overallTotal: 0,
        overallLevel: EvaluationLevelEnum.EVALUAR,
        saving: false,
        saved: false,
        notes: '',
      };
    });
  }
}
