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
import { Tournament } from '@ltrc-ps/shared-api-model';
import { TournamentFormValue } from '../../services/tournaments.service';

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

  tournamentForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    season: [''],
    description: [''],
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