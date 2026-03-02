import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  inject,
} from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { SportEnum, Tournament } from '@ltrc-ps/shared-api-model';
import { TournamentFormValue } from '../../services/tournaments.service';
import { SportOption, sportOptions } from '../../../players/position-options';

@Component({
  standalone: true,
  selector: 'ltrc-tournament-form',
  imports: [
    ReactiveFormsModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatCardModule,
    MatFormFieldModule,
    MatSelectModule,
  ],
  templateUrl: './tournament-form.component.html',
  styleUrl: './tournament-form.component.scss',
})
export class TournamentFormComponent implements OnChanges {
  private readonly fb = inject(FormBuilder);

  @Input() tournament?: Tournament;
  @Input() submitting = false;

  @Output() readonly formSubmit = new EventEmitter<TournamentFormValue>();
  @Output() readonly cancel = new EventEmitter<void>();

  readonly sportOptions: SportOption[] = sportOptions;

  tournamentForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    season: [''],
    description: [''],
    sport: [null as SportEnum | null],
  });

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tournament'] && this.tournament) {
      this.tournamentForm.patchValue(this.tournament);
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onSubmit(): void {
    if (this.tournamentForm.invalid) return;
    this.formSubmit.emit(this.tournamentForm.getRawValue() as TournamentFormValue);
  }
}