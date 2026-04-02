import { Component, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatSelectModule } from '@angular/material/select';
import { CategoryEnum, Player } from '@ltrc-campo/shared-api-model';
import { CategoryOption, getCategoryOptionsBySport } from '../../../common/category-options';

export interface ChangeCategoryDialogData {
  player: Player;
}

@Component({
  selector: 'ltrc-change-category-dialog',
  standalone: true,
  imports: [FormsModule, MatButtonModule, MatDialogModule, MatFormFieldModule, MatSelectModule],
  templateUrl: './change-category-dialog.component.html',
  styleUrl: './change-category-dialog.component.scss',
})
export class ChangeCategoryDialogComponent {
  readonly dialogRef = inject(MatDialogRef<ChangeCategoryDialogComponent>);
  readonly data: ChangeCategoryDialogData = inject(MAT_DIALOG_DATA);

  selectedCategory: CategoryEnum | null = (this.data.player.category as CategoryEnum) ?? null;
  readonly categoryOptions: CategoryOption[] = getCategoryOptionsBySport(this.data.player.sport as any);

  save(): void {
    if (!this.selectedCategory) return;
    this.dialogRef.close(this.selectedCategory);
  }
}
