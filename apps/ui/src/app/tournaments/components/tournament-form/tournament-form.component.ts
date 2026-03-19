import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  OnInit,
  SimpleChanges,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  FormBuilder,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CategoryEnum, MatchTypeEnum, SportEnum, Tournament } from '@ltrc-campo/shared-api-model';
import { TournamentFormValue } from '../../services/tournaments.service';
import { SportOption, sportOptions } from '../../../common/sport-options';
import {
  CategoryOption,
  getCategoryOptionsBySport,
} from '../../../common/category-options';
import { matchTypeOptions, MatchOption } from '../../tournament-options';

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
export class TournamentFormComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);

  @Input() tournament?: Tournament;
  @Input() submitting = false;

  @Output() readonly formSubmit = new EventEmitter<TournamentFormValue>();
  @Output() readonly cancel = new EventEmitter<void>();

  readonly sportOptions: SportOption[] = sportOptions;
  readonly typeOptions: MatchOption<MatchTypeEnum>[] = matchTypeOptions;
  categoryOptions: CategoryOption[] = getCategoryOptionsBySport();

  tournamentForm: FormGroup = this.fb.group({
    name: ['', Validators.required],
    season: [''],
    description: [''],
    sport: [null as SportEnum | null],
    categories: [[] as CategoryEnum[]],
    type: [null as MatchTypeEnum | null],
  });

  ngOnInit(): void {
    this.tournamentForm
      .get('sport')!
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((sport: SportEnum | null) => {
        this.categoryOptions = getCategoryOptionsBySport(sport);

        const selected: CategoryEnum[] =
          this.tournamentForm.get('categories')?.value ?? [];
        const validIds = new Set(this.categoryOptions.map((c) => c.id));
        const stillValid = selected.filter((c) => validIds.has(c));
        if (stillValid.length !== selected.length) {
          this.tournamentForm.get('categories')?.setValue(stillValid);
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['tournament'] && this.tournament) {
      this.categoryOptions = getCategoryOptionsBySport(this.tournament.sport);
      this.tournamentForm.patchValue({
        ...this.tournament,
        categories: this.tournament.categories ?? [],
        type: this.tournament.type ?? null,
      });
    }
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onSubmit(): void {
    if (this.tournamentForm.invalid) return;
    this.formSubmit.emit(
      this.tournamentForm.getRawValue() as TournamentFormValue
    );
  }
}
