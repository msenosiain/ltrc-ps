import {
  Component,
  DestroyRef,
  EventEmitter,
  Input,
  OnInit,
  Output,
  inject,
} from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { debounceTime } from 'rxjs';
import {
  CategoryEnum,
  HockeyBranchEnum,
  SportEnum,
} from '@ltrc-campo/shared-api-model';
import {
  BranchOption,
  branchOptions,
} from '../../../common/branch-options';
import {
  CategoryOption,
  getCategoryOptionsBySport,
} from '../../../common/category-options';
import { UserFilterContextService } from '../../../common/services/user-filter-context.service';

export interface BranchSearchFilters {
  season: number;
  category?: CategoryEnum;
  branch?: HockeyBranchEnum;
}

@Component({
  selector: 'ltrc-branch-search',
  standalone: true,
  imports: [ReactiveFormsModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './branch-search.component.html',
  styleUrl: './branch-search.component.scss',
})
export class BranchSearchComponent implements OnInit {
  @Input() initialFilters?: Record<string, unknown>;

  @Output() filtersChange = new EventEmitter<BranchSearchFilters>();

  private readonly fb = inject(FormBuilder);
  private readonly filterContext = inject(UserFilterContextService);
  private readonly destroyRef = inject(DestroyRef);

  readonly currentYear = new Date().getFullYear();
  readonly seasonOptions = Array.from({ length: 5 }, (_, i) => this.currentYear - i);
  filteredBranchOptions: BranchOption[] = branchOptions;
  categoryOptions: CategoryOption[] = getCategoryOptionsBySport(SportEnum.HOCKEY);

  searchForm = this.fb.group({
    season: [this.currentYear],
    category: [undefined as CategoryEnum | undefined],
    branch: [undefined as HockeyBranchEnum | undefined],
  });

  showCategoryFilter = true;
  showBranchFilter = true;

  ngOnInit(): void {
    if (this.initialFilters) {
      this.searchForm.patchValue(this.initialFilters, { emitEvent: false });
    }

    this.filterContext.filterContext$.pipe(takeUntilDestroyed(this.destroyRef)).subscribe((ctx) => {
      if (ctx.forcedCategory) {
        this.searchForm.get('category')!.setValue(ctx.forcedCategory, { emitEvent: false });
        this.showCategoryFilter = false;
      }
      if (ctx.forcedBranch) {
        this.searchForm.get('branch')!.setValue(ctx.forcedBranch, { emitEvent: false });
        this.showBranchFilter = false;
      }
      this.categoryOptions = ctx.categoryOptions.filter(
        (c) => c.sport === null || c.sport === SportEnum.HOCKEY
      );
      this.filteredBranchOptions = ctx.branchOptions;
    });

    this.searchForm.valueChanges.pipe(debounceTime(300), takeUntilDestroyed(this.destroyRef)).subscribe(() => {
      this.emitFilters();
    });

    // Emit initial filters
    this.emitFilters();
  }

  private emitFilters(): void {
    const v = this.searchForm.value;
    this.filtersChange.emit({
      season: v.season ?? this.currentYear,
      category: v.category ?? undefined,
      branch: v.branch ?? undefined,
    });
  }
}
