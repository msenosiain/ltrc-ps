
import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  OnInit,
  inject,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Match, MatchStatusEnum, Tournament } from '@ltrc-ps/shared-api-model';
import { matchStatusOptions, matchTypeOptions } from '../../match-options';
import { buildCreateMatchForm } from '../../forms/match-form.factory';
import { MatchFormValue } from '../../forms/match-form.types';
import { TournamentsService } from '../../../tournaments/services/tournaments.service';

@Component({
  standalone: true,
  selector: 'ltrc-match-form',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatCardModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatSlideToggleModule,
  ],
  templateUrl: './match-form.component.html',
  styleUrl: './match-form.component.scss',
})
export class MatchFormComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly tournamentsService = inject(TournamentsService);

  @Input() match?: Match;
  @Input() submitting = false;

  @Output() readonly formSubmit = new EventEmitter<MatchFormValue>();
  @Output() readonly cancel = new EventEmitter<void>();

  readonly statusOptions = matchStatusOptions;
  readonly typeOptions = matchTypeOptions;
  readonly MatchStatusEnum = MatchStatusEnum;

  tournaments: Tournament[] = [];
  matchForm: FormGroup = buildCreateMatchForm(this.fb);

  ngOnInit(): void {
    this.tournamentsService.getTournaments().subscribe((t) => (this.tournaments = t));
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['match'] && this.match) {
      this.matchForm.patchValue({
        ...this.match,
        date: this.match.date ? new Date(this.match.date) : null,
        tournament: (this.match.tournament as Tournament)?.id ?? null,
      });
    }
  }

  get statusValue(): MatchStatusEnum {
    return this.matchForm.get('status')?.value;
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onSubmit(): void {
    if (this.matchForm.invalid) return;
    this.formSubmit.emit(this.matchForm.getRawValue() as MatchFormValue);
  }
}
