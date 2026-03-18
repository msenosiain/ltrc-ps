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
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import {
  CategoryEnum,
  SportEnum,
  TrainingSessionStatusEnum,
  TrainingSessionFilters,
} from '@ltrc-ps/shared-api-model';
import {
  getCategoryOptionsBySport,
  sessionStatusOptions,
  sportOptions,
  TrainingOption,
} from '../../training-options';
import { nullToUndefined } from '../../../common/utils/null-to-undefined';
import { UserFilterContextService } from '../../../common/services/user-filter-context.service';
import { SportOption } from '../../../common/sport-options';

@Component({
  selector: 'ltrc-session-search',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './session-search.component.html',
  styleUrl: './session-search.component.scss',
})
export class SessionSearchComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly filterContext = inject(UserFilterContextService);

  @Input() initialFilters?: Record<string, unknown>;
  @Output() readonly filtersChange = new EventEmitter<TrainingSessionFilters>();

  readonly statusOptions = sessionStatusOptions;
  sportOptions: SportOption[] = sportOptions;
  categoryOptions: TrainingOption<CategoryEnum>[] = getCategoryOptionsBySport();
  showSportFilter = true;
  showCategoryFilter = true;

  readonly searchForm = this.fb.group({
    sport: [undefined as SportEnum | undefined],
    category: [undefined as CategoryEnum | undefined],
    status: [undefined as TrainingSessionStatusEnum | undefined],
  });

  ngOnInit(): void {
    if (this.initialFilters) {
      this.searchForm.patchValue(this.initialFilters, { emitEvent: false });
    }

    this.filterContext.filterContext$
      .pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((ctx) => {
        this.showSportFilter = ctx.showSportFilter;
        this.showCategoryFilter = ctx.showCategoryFilter;
        this.sportOptions = ctx.sportOptions;
        this.categoryOptions = ctx.categoryOptions;

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

        this.emitFilters();
      });

    this.searchForm
      .get('sport')!
      .valueChanges.pipe(takeUntilDestroyed(this.destroyRef))
      .subscribe((sport) => {
        this.categoryOptions = getCategoryOptionsBySport(sport);
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
      nullToUndefined(this.searchForm.value) as TrainingSessionFilters
    );
  }
}
