import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CategoryEnum, HockeyBranchEnum, SportEnum } from '@ltrc-campo/shared-api-model';
import { FilterContext } from '../../services/user-filter-context.service';
import { getCategoryOptionsBySport } from '../../category-options';
import { CategoryOption } from '../../category-options';
import { SportOption } from '../../sport-options';
import { BranchOption } from '../../branch-options';

export interface ScopeFilterDialogData {
  filterContext: FilterContext;
  selected: ScopeFilterSelection;
}

export interface ScopeFilterSelection {
  sport?: SportEnum;
  category?: CategoryEnum;
  branch?: HockeyBranchEnum;
}

@Component({
  selector: 'ltrc-scope-filter-dialog',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './scope-filter-dialog.component.html',
  styleUrl: './scope-filter-dialog.component.scss',
})
export class ScopeFilterDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ScopeFilterDialogComponent>);
  readonly data: ScopeFilterDialogData = inject(MAT_DIALOG_DATA);

  selectedSport: SportEnum | undefined = this.data.selected.sport;
  selectedCategory: CategoryEnum | undefined = this.data.selected.category;
  selectedBranch: HockeyBranchEnum | undefined = this.data.selected.branch;

  get sportOptions(): SportOption[] {
    return this.data.filterContext.sportOptions;
  }

  get categoryOptions(): CategoryOption[] {
    const ctx = this.data.filterContext;
    if (this.selectedSport) {
      const sportCats = getCategoryOptionsBySport(this.selectedSport).map((c) => c.id);
      return ctx.categoryOptions.filter((c) => sportCats.includes(c.id));
    }
    return ctx.categoryOptions;
  }

  get branchOptions(): BranchOption[] {
    return this.data.filterContext.branchOptions;
  }

  get showSport(): boolean {
    return this.data.filterContext.sportOptions.length > 1;
  }

  get showCategory(): boolean {
    return this.categoryOptions.length > 1;
  }

  get showBranch(): boolean {
    return this.data.filterContext.showBranchFilter && this.branchOptions.length > 1;
  }

  onSportChange(): void {
    this.selectedCategory = undefined;
  }

  apply(): void {
    this.dialogRef.close({
      sport: this.selectedSport,
      category: this.selectedCategory,
      branch: this.selectedBranch,
    } satisfies ScopeFilterSelection);
  }

  clear(): void {
    this.dialogRef.close({} satisfies ScopeFilterSelection);
  }
}
