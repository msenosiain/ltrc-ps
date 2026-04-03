import { Component, inject, OnInit } from '@angular/core';
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
import { MatchesService } from '../../../matches/services/matches.service';

export interface ScopeFilterDialogData {
  filterContext: FilterContext;
  selected: ScopeFilterSelection;
}

export interface ScopeFilterSelection {
  sport?: SportEnum;
  category?: CategoryEnum;
  branch?: HockeyBranchEnum;
  division?: string;
}

@Component({
  selector: 'ltrc-scope-filter-dialog',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './scope-filter-dialog.component.html',
  styleUrl: './scope-filter-dialog.component.scss',
})
export class ScopeFilterDialogComponent implements OnInit {
  readonly dialogRef = inject(MatDialogRef<ScopeFilterDialogComponent>);
  readonly data: ScopeFilterDialogData = inject(MAT_DIALOG_DATA);
  private readonly matchesService = inject(MatchesService);

  selectedSport: SportEnum | undefined = this.data.selected.sport;
  selectedCategory: CategoryEnum | undefined = this.data.selected.category;
  selectedBranch: HockeyBranchEnum | undefined = this.data.selected.branch;
  selectedDivision: string | undefined = this.data.selected.division;

  divisionOptions: string[] = [];

  ngOnInit(): void {
    const effectiveSport = this.selectedSport ?? this.data.filterContext.forcedSport;
    if (effectiveSport === SportEnum.RUGBY) {
      this.loadDivisions();
    }
  }

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
    if (!this.data.filterContext.showBranchFilter || this.branchOptions.length <= 1) return false;
    const effectiveSport = this.selectedSport ?? this.data.filterContext.forcedSport;
    return effectiveSport === SportEnum.HOCKEY;
  }

  get showDivision(): boolean {
    const effectiveSport = this.selectedSport ?? this.data.filterContext.forcedSport;
    return effectiveSport === SportEnum.RUGBY && this.divisionOptions.length > 0;
  }

  onSportChange(): void {
    this.selectedCategory = undefined;
    this.selectedBranch = undefined;
    this.selectedDivision = undefined;
    this.divisionOptions = [];
    if (this.selectedSport === SportEnum.RUGBY) {
      this.loadDivisions();
    }
  }

  private loadDivisions(): void {
    this.matchesService.getFieldOptions().subscribe({
      next: (opts) => { this.divisionOptions = opts.divisions.sort(); },
      error: () => { this.divisionOptions = []; },
    });
  }

  apply(): void {
    this.dialogRef.close({
      sport: this.selectedSport,
      category: this.selectedCategory,
      branch: this.selectedBranch,
      division: this.selectedDivision,
    } satisfies ScopeFilterSelection);
  }

  clear(): void {
    this.dialogRef.close({} satisfies ScopeFilterSelection);
  }
}
