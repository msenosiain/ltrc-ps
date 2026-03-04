import {
  Component,
  DestroyRef,
  EventEmitter,
  inject,
  OnInit,
  Output,
} from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { debounceTime } from 'rxjs/operators';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import {
  CategoryEnum,
  PlayerPosition,
  SportEnum,
} from '@ltrc-ps/shared-api-model';
import {
  CategoryOption,
  getCategoryOptionsBySport,
} from '../../../common/category-options';
import { SportOption, sportOptions } from '../../../common/sport-options';
import {
  getPositionOptionsBySport,
  PositionOption,
} from '../../position-options';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { nullToUndefined } from '../../../common/utils/null-to-undefined';
import { UserFilterContextService } from '../../../common/services/user-filter-context.service';

@Component({
  selector: 'ltrc-player-search',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatIconModule,
    MatSelectModule,
    MatInputModule,
    MatButtonModule,
  ],
  templateUrl: './player-search.component.html',
  styleUrls: ['./player-search.component.scss'],
})
export class PlayerSearchComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly filterContext = inject(UserFilterContextService);

  @Output() readonly filtersChange = new EventEmitter<{
    searchTerm?: string;
    sport?: SportEnum;
    position?: PlayerPosition;
    category?: CategoryEnum;
  }>();

  sportOptions: SportOption[] = sportOptions;
  categoryOptions: CategoryOption[] = getCategoryOptionsBySport();
  positionOptions: PositionOption[] = getPositionOptionsBySport();

  showSportFilter = true;
  showCategoryFilter = true;

  readonly searchForm = this.fb.group({
    searchTerm: [''],
    sport: [undefined as SportEnum | undefined],
    position: [undefined as PlayerPosition | undefined],
    category: [undefined as CategoryEnum | undefined],
  });

  ngOnInit(): void {
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
          this.positionOptions = getPositionOptionsBySport(ctx.forcedSport);
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
        this.categoryOptions = this.filterCategoryOptions(sport);
        this.positionOptions = getPositionOptionsBySport(sport);

        const cat = this.searchForm.get('category')?.value;
        if (cat && !this.categoryOptions.find((c) => c.id === cat)) {
          this.searchForm
            .get('category')
            ?.setValue(undefined, { emitEvent: false });
        }
        const pos = this.searchForm.get('position')?.value;
        if (pos && !this.positionOptions.find((p) => p.id === pos)) {
          this.searchForm
            .get('position')
            ?.setValue(undefined, { emitEvent: false });
        }
      });

    this.searchForm.valueChanges
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe(() => this.emitFilters());
  }

  clearField(field: string): void {
    this.searchForm.get(field)?.setValue(undefined);
  }

  private filterCategoryOptions(sport?: SportEnum | null): CategoryOption[] {
    return getCategoryOptionsBySport(sport);
  }

  private emitFilters(): void {
    this.filtersChange.emit(nullToUndefined(this.searchForm.value));
  }
}
