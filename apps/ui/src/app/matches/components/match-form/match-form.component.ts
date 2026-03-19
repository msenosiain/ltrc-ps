import {
  Component,
  EventEmitter,
  Input,
  Output,
  OnChanges,
  SimpleChanges,
  OnInit,
  inject,
  DestroyRef,
} from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  Validators,
} from '@angular/forms';
import { AsyncPipe } from '@angular/common';
import { Observable, startWith, map } from 'rxjs';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import {
  CategoryEnum,
  Match,
  MatchStatusEnum,
  SportEnum,
  Tournament,
  isCompetitiveCategory,
} from '@ltrc-campo/shared-api-model';
import {
  getCategoryOptionsBySport,
  matchStatusOptions,
  sportOptions,
} from '../../match-options';
import { CategoryOption } from '../../../common/category-options';
import { buildCreateMatchForm } from '../../forms/match-form.factory';
import { MatchFormValue } from '../../forms/match-form.types';
import { MatchesService } from '../../services/matches.service';
import { TournamentsService } from '../../../tournaments/services/tournaments.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';

function filterOptions(options: string[], value: string): string[] {
  const lc = (value ?? '').toLowerCase();
  return options.filter((o) => o.toLowerCase().includes(lc));
}

@Component({
  standalone: true,
  selector: 'ltrc-match-form',
  imports: [
    ReactiveFormsModule,
    AsyncPipe,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatProgressBarModule,
    MatCardModule,
    MatFormFieldModule,
    MatDatepickerModule,
    MatSlideToggleModule,
    MatAutocompleteModule,
  ],
  templateUrl: './match-form.component.html',
  styleUrl: './match-form.component.scss',
})
export class MatchFormComponent implements OnInit, OnChanges {
  private readonly fb = inject(FormBuilder);
  private readonly matchesService = inject(MatchesService);
  private readonly tournamentsService = inject(TournamentsService);
  private readonly destroyRef = inject(DestroyRef);

  @Input() match?: Match;
  @Input() submitting = false;

  @Output() readonly formSubmit = new EventEmitter<MatchFormValue>();
  @Output() readonly cancel = new EventEmitter<void>();

  readonly statusOptions = matchStatusOptions;
  readonly sportOptions = sportOptions;
  readonly MatchStatusEnum = MatchStatusEnum;

  categoryOptions: CategoryOption[] = getCategoryOptionsBySport(null);
  filteredTournaments: Tournament[] = [];
  tournaments: Tournament[] = [];
  matchForm: FormGroup = buildCreateMatchForm(this.fb);

  /** Whether the current category + sport combination is competitive */
  isCompetitive = false;

  /** Sport derived from the selected tournament */
  tournamentSport: SportEnum | null = null;

  /** Control de deporte: standalone, filtra torneos. Se deshabilita al elegir torneo. */
  readonly sportControl = new FormControl<SportEnum | null>(null);

  /** Control de hora: standalone, no forma parte de MatchFormValue.
   *  Al cambiar, fusiona la hora en el control `date` del form. */
  readonly timeControl = new FormControl<string>('', Validators.required);

  private allOpponents: string[] = [];
  private allVenues: string[] = [];
  private allDivisions: string[] = [];

  filteredOpponents$!: Observable<string[]>;
  filteredVenues$!: Observable<string[]>;
  filteredDivisions$!: Observable<string[]>;

  ngOnInit(): void {
    this.filteredOpponents$ = this.matchForm.get('opponent')!.valueChanges.pipe(
      startWith(''),
      map((v) => filterOptions(this.allOpponents, v ?? '')),
      takeUntilDestroyed(this.destroyRef)
    );
    this.filteredVenues$ = this.matchForm.get('venue')!.valueChanges.pipe(
      startWith(''),
      map((v) => filterOptions(this.allVenues, v ?? '')),
      takeUntilDestroyed(this.destroyRef)
    );
    this.filteredDivisions$ = this.matchForm.get('division')!.valueChanges.pipe(
      startWith(''),
      map((v) => filterOptions(this.allDivisions, v ?? '')),
      takeUntilDestroyed(this.destroyRef)
    );

    this.matchesService
      .getFieldOptions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ opponents, venues, divisions }) => {
        this.allOpponents = opponents;
        this.allVenues = venues;
        this.allDivisions = divisions;
      });

    this.tournamentsService
      .getTournaments({ page: 1, size: 1000 })
      .pipe(map((res) => res.items))
      .subscribe((t) => {
        this.tournaments = t;
        this.filteredTournaments = t;
      });

    // When sport control changes: filter tournament list
    this.sportControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((sport) => {
        this.filteredTournaments = sport
          ? this.tournaments.filter((t) => !t.sport || t.sport === sport)
          : this.tournaments;
        // If current tournament no longer in filtered list, clear it
        const currentTournament = this.matchForm.get('tournament')?.value;
        if (currentTournament && !this.filteredTournaments.find((t) => t.id === currentTournament)) {
          this.matchForm.get('tournament')?.setValue(null);
        }
      });

    // When tournament changes: derive sport, update categories, compute competitive
    this.matchForm
      .get('tournament')!
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((tournamentId: string | null) => {
        this.applyTournamentDefaults(tournamentId);
      });

    // When category changes: recompute competitive
    this.matchForm
      .get('category')!
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        this.updateCompetitive();
      });

    // Cuando el usuario selecciona una hora, fusionarla en el control date.
    this.timeControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((time) => this.applyTimeToDate(time ?? ''));

    // Cuando el datepicker cambia la fecha, re-aplicar la hora para no perderla.
    this.matchForm
      .get('date')!
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.timeControl.value) {
          this.applyTimeToDate(this.timeControl.value);
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['match'] && this.match) {
      const tournament = this.match.tournament as Tournament | undefined;
      this.tournamentSport = tournament?.sport ?? null;
      this.categoryOptions = this.categoryOptionsForTournament(tournament);

      const matchDate = this.match.date ? new Date(this.match.date) : null;
      const h = matchDate?.getHours() ?? 0;
      const m = matchDate?.getMinutes() ?? 0;
      const timeStr = h || m
        ? `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
        : '';
      this.timeControl.setValue(timeStr, { emitEvent: false });

      this.sportControl.setValue(tournament?.sport ?? null, { emitEvent: false });
      if (tournament) {
        this.sportControl.disable({ emitEvent: false });
      }

      this.matchForm.patchValue({
        ...this.match,
        date: matchDate,
        tournament: tournament?.id ?? null,
      });

      this.updateCompetitive();
    }
  }

  get statusValue(): MatchStatusEnum {
    return this.matchForm.get('status')?.value;
  }

  get formInvalid(): boolean {
    return this.matchForm.invalid || this.timeControl.invalid;
  }

  onCancel(): void {
    this.cancel.emit();
  }

  onSubmit(): void {
    if (this.formInvalid) return;
    this.formSubmit.emit(this.matchForm.getRawValue() as MatchFormValue);
  }

  private categoryOptionsForTournament(tournament: Tournament | undefined): CategoryOption[] {
    if (tournament?.categories?.length) {
      const allForSport = getCategoryOptionsBySport(tournament.sport ?? null);
      return allForSport.filter((opt) => tournament.categories!.includes(opt.id));
    }
    return getCategoryOptionsBySport(tournament?.sport ?? null);
  }

  private applyTournamentDefaults(tournamentId: string | null): void {
    const tournament = this.tournaments.find((t) => t.id === tournamentId);
    this.tournamentSport = tournament?.sport ?? null;
    this.categoryOptions = this.categoryOptionsForTournament(tournament);

    if (tournament) {
      // Lock sport to tournament's sport
      this.sportControl.setValue(tournament.sport ?? null, { emitEvent: false });
      this.sportControl.disable({ emitEvent: false });
    } else {
      this.sportControl.enable({ emitEvent: false });
    }

    // Auto-select if only one option
    if (this.categoryOptions.length === 1) {
      this.matchForm.get('category')?.setValue(this.categoryOptions[0].id);
    } else {
      // Clear if current value is no longer valid
      const currentCat = this.matchForm.get('category')?.value;
      if (currentCat && !this.categoryOptions.find((c) => c.id === currentCat)) {
        this.matchForm.get('category')?.setValue(null);
      }
    }

    this.updateCompetitive();
  }

  private updateCompetitive(): void {
    const category = this.matchForm.get('category')?.value as CategoryEnum | null;
    const wasCompetitive = this.isCompetitive;

    this.isCompetitive =
      !!category &&
      !!this.tournamentSport &&
      isCompetitiveCategory(category, this.tournamentSport);

    if (this.isCompetitive !== wasCompetitive) {
      this.updateOpponentValidation();
    }
  }

  private updateOpponentValidation(): void {
    const opponent = this.matchForm.get('opponent')!;
    if (this.isCompetitive) {
      opponent.setValidators(Validators.required);
    } else {
      opponent.clearValidators();
    }
    opponent.updateValueAndValidity();
  }

  private applyTimeToDate(time: string): void {
    const date = this.matchForm.get('date')?.value as Date | null;
    if (!date || !time) return;
    const [h, m] = time.split(':').map(Number);
    const merged = new Date(date);
    merged.setHours(h ?? 0, m ?? 0, 0, 0);
    this.matchForm.get('date')?.setValue(merged, { emitEvent: false });
  }
}
