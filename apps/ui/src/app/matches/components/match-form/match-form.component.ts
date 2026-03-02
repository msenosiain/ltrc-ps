
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
import { FormBuilder, FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
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
import { MatTimepickerModule } from '@angular/material/timepicker';
import { Match, MatchStatusEnum, SportEnum, Tournament } from '@ltrc-ps/shared-api-model';
import {
  getCategoryOptionsBySport,
  matchStatusOptions,
  matchTypeOptions,
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
    MatTimepickerModule,
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
  readonly typeOptions = matchTypeOptions;
  readonly sportOptions = sportOptions;
  readonly MatchStatusEnum = MatchStatusEnum;

  categoryOptions: CategoryOption[] = getCategoryOptionsBySport(null);
  tournaments: Tournament[] = [];
  matchForm: FormGroup = buildCreateMatchForm(this.fb);

  /** Control de hora: standalone, no forma parte de MatchFormValue.
   *  Al cambiar, fusiona la hora en el control `date` del form. */
  readonly timeControl = new FormControl<Date | null>(null, Validators.required);

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
      takeUntilDestroyed(this.destroyRef),
    );
    this.filteredVenues$ = this.matchForm.get('venue')!.valueChanges.pipe(
      startWith(''),
      map((v) => filterOptions(this.allVenues, v ?? '')),
      takeUntilDestroyed(this.destroyRef),
    );
    this.filteredDivisions$ = this.matchForm.get('division')!.valueChanges.pipe(
      startWith(''),
      map((v) => filterOptions(this.allDivisions, v ?? '')),
      takeUntilDestroyed(this.destroyRef),
    );

    this.matchesService.getFieldOptions()
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(({ opponents, venues, divisions }) => {
        this.allOpponents = opponents;
        this.allVenues = venues;
        this.allDivisions = divisions;
      });

    this.tournamentsService.getTournaments().subscribe((t) => (this.tournaments = t));

    this.matchForm.get('sport')!.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((sport: SportEnum | null) => {
        this.categoryOptions = getCategoryOptionsBySport(sport);
        const cat = this.matchForm.get('category')?.value;
        if (cat && !this.categoryOptions.find((c) => c.id === cat)) {
          this.matchForm.get('category')?.setValue(null);
        }
      });

    // Cuando el usuario selecciona una hora, fusionarla en el control date.
    this.timeControl.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((time) => this.applyTimeToDate(time));

    // Cuando el datepicker cambia la fecha, re-aplicar la hora para no perderla.
    this.matchForm.get('date')!.valueChanges
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe(() => {
        if (this.timeControl.value) {
          this.applyTimeToDate(this.timeControl.value);
        }
      });
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['match'] && this.match) {
      this.categoryOptions = getCategoryOptionsBySport(this.match.sport ?? null);
      const matchDate = this.match.date ? new Date(this.match.date) : null;
      const h = matchDate?.getHours() ?? 0;
      const m = matchDate?.getMinutes() ?? 0;
      this.timeControl.setValue(
        (h || m) ? new Date(2000, 0, 1, h, m) : null,
        { emitEvent: false },
      );
      this.matchForm.patchValue({
        ...this.match,
        date: matchDate,
        tournament: (this.match.tournament as Tournament)?.id ?? null,
      });
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

  private applyTimeToDate(time: Date | null): void {
    const date = this.matchForm.get('date')?.value as Date | null;
    if (!date) return;
    const merged = new Date(date);
    merged.setHours(time?.getHours() ?? 0, time?.getMinutes() ?? 0, 0, 0);
    this.matchForm.get('date')?.setValue(merged, { emitEvent: false });
  }
}