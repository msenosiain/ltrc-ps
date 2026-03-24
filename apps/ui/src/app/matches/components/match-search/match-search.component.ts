import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  Input,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, map } from 'rxjs/operators';
import { forkJoin } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  CategoryEnum,
  MatchStatusEnum,
  SportEnum,
  Tournament,
} from '@ltrc-campo/shared-api-model';
import {
  getCategoryOptionsBySport,
  matchStatusOptions,
  MatchOption,
  sportOptions,
} from '../../match-options';
import { MatchFilters } from '../../forms/match-form.types';
import { nullToUndefined } from '../../../common/utils/null-to-undefined';
import { TournamentsService } from '../../../tournaments/services/tournaments.service';
import { MatchesService } from '../../services/matches.service';
import { UserFilterContextService } from '../../../common/services/user-filter-context.service';
import { SportOption } from '../../../common/sport-options';

@Component({
  selector: 'ltrc-match-search',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './match-search.component.html',
  styleUrl: './match-search.component.scss',
})
export class MatchSearchComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly tournamentsService = inject(TournamentsService);
  private readonly matchesService = inject(MatchesService);
  private readonly filterContext = inject(UserFilterContextService);

  @Input() initialFilters?: Record<string, unknown>;

  @Output() readonly filtersChange = new EventEmitter<MatchFilters>();

  readonly statusOptions = matchStatusOptions;
  sportOptions: SportOption[] = sportOptions;
  categoryOptions: MatchOption<CategoryEnum>[] = getCategoryOptionsBySport();
  tournaments: Tournament[] = [];
  allTournaments: Tournament[] = [];
  opponents: string[] = [];

  showSportFilter = true;
  showCategoryFilter = true;

  private allowedCategories: CategoryEnum[] | undefined;

  readonly searchForm = this.fb.group({
    status: [undefined as MatchStatusEnum | undefined],
    sport: [undefined as SportEnum | undefined],
    category: [undefined as CategoryEnum | undefined],
    opponent: [undefined as string | undefined],
    tournament: [undefined as string | undefined],
  });

  ngOnInit(): void {
    if (this.initialFilters) {
      this.searchForm.patchValue(this.initialFilters, { emitEvent: false });
    }

    forkJoin({
      allTournaments: this.tournamentsService.getTournaments({ page: 1, size: 1000 }).pipe(map((res) => res.items)),
      fieldOptions: this.matchesService.getFieldOptions(),
    }).subscribe(({ allTournaments, fieldOptions }) => {
      this.allTournaments = allTournaments;
      this.opponents = fieldOptions.opponents.sort();
      if (fieldOptions.tournamentIds) {
        this.tournaments = allTournaments.filter((t) => fieldOptions.tournamentIds!.includes(t.id!));
      } else {
        this.tournaments = allTournaments;
      }
    });

    this.filterContext.filterContext$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ctx) => {
        this.showSportFilter = ctx.showSportFilter;
        this.showCategoryFilter = ctx.showCategoryFilter;
        this.sportOptions = ctx.sportOptions;
        this.categoryOptions = ctx.categoryOptions;
        this.allowedCategories = ctx.forcedCategory
          ? [ctx.forcedCategory]
          : ctx.categoryOptions.length < getCategoryOptionsBySport().length
            ? ctx.categoryOptions.map((c) => c.id)
            : undefined;

        if (ctx.forcedSport) {
          this.searchForm
            .get('sport')!
            .setValue(ctx.forcedSport, { emitEvent: false });
        }
        if (ctx.forcedCategory) {
          this.searchForm
            .get('category')!
            .setValue(ctx.forcedCategory, { emitEvent: false });
        }

      });

    this.searchForm
      .get('sport')!
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((sport) => {
        const allForSport = getCategoryOptionsBySport(sport);
        this.categoryOptions = this.allowedCategories
          ? allForSport.filter((c) => this.allowedCategories!.includes(c.id))
          : allForSport;
        const currentCategory = this.searchForm.get('category')!.value;
        if (
          currentCategory &&
          !this.categoryOptions.some((c) => c.id === currentCategory)
        ) {
          this.searchForm
            .get('category')!
            .setValue(undefined, { emitEvent: false });
        }
      });

    this.searchForm.valueChanges
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.emitFilters());
  }

  clearField(field: string): void {
    this.searchForm.get(field)?.setValue(undefined);
  }

  private emitFilters(): void {
    this.filtersChange.emit(
      nullToUndefined(this.searchForm.value) as MatchFilters
    );
  }
}
