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
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CategoryEnum, RoleEnum, SportEnum } from '@ltrc-campo/shared-api-model';
import { roleOptions } from '../../user-options';
import { UserFilters } from '../../forms/user-form.types';
import { nullToUndefined } from '../../../common/utils/null-to-undefined';
import { SportOption, sportOptions } from '../../../common/sport-options';
import { CategoryOption, getCategoryOptionsBySport } from '../../../common/category-options';
import { UserFilterContextService } from '../../../common/services/user-filter-context.service';

@Component({
  selector: 'ltrc-user-search',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
  ],
  templateUrl: './user-search.component.html',
  styleUrl: './user-search.component.scss',
})
export class UserSearchComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly destroyRef = inject(DestroyRef);
  private readonly filterContext = inject(UserFilterContextService);

  @Input() initialFilters?: Record<string, unknown>;

  @Output() readonly filtersChange = new EventEmitter<UserFilters>();

  filtersExpanded = false;
  readonly roleOptions = roleOptions;
  sportOptions: SportOption[] = sportOptions;
  categoryOptions: CategoryOption[] = [];
  showSportFilter = true;
  showCategoryFilter = true;

  readonly searchForm = this.fb.group({
    searchTerm: [''],
    role: [undefined as RoleEnum | undefined],
    sport: [undefined as SportEnum | undefined],
    category: [undefined as CategoryEnum | undefined],
  });

  ngOnInit(): void {
    this.filterContext.filterContext$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((ctx) => {
      if (ctx.forcedSport) {
        this.searchForm.get('sport')!.setValue(ctx.forcedSport, { emitEvent: false });
        this.showSportFilter = false;
      }
      if (ctx.forcedCategory) {
        this.searchForm.get('category')!.setValue(ctx.forcedCategory, { emitEvent: false });
        this.showCategoryFilter = false;
      }
      this.categoryOptions = ctx.categoryOptions;
    });

    if (this.initialFilters) {
      this.searchForm.patchValue(this.initialFilters, { emitEvent: false });
    }

    this.searchForm.valueChanges
      .pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef))
      .subscribe((values) =>
        this.filtersChange.emit(nullToUndefined(values) as UserFilters)
      );
  }

  onSportChange(): void {
    this.searchForm.get('category')!.setValue(undefined, { emitEvent: false });
    const sport = this.searchForm.get('sport')?.value;
    this.categoryOptions = sport ? getCategoryOptionsBySport(sport) : [];
  }

  clearField(field: string): void {
    this.searchForm.get(field)?.setValue(undefined);
  }
}
