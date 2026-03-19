import { Component, inject } from '@angular/core';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import {
  MatDialogModule,
  MatDialogRef,
  MAT_DIALOG_DATA,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatRadioModule } from '@angular/material/radio';
import { MatSelectModule } from '@angular/material/select';
import { Squad } from '@ltrc-campo/shared-api-model';

export interface SaveSquadTemplateDialogData {
  squads: Squad[];
}

export type SaveSquadTemplateDialogResult =
  | { mode: 'create'; name: string }
  | { mode: 'overwrite'; squadId: string };

@Component({
  selector: 'ltrc-save-squad-template-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatButtonModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatRadioModule,
    MatSelectModule,
  ],
  templateUrl: './save-squad-template-dialog.component.html',
  styleUrl: './save-squad-template-dialog.component.scss',
})
export class SaveSquadTemplateDialogComponent {
  readonly dialogRef = inject(MatDialogRef<SaveSquadTemplateDialogComponent>);
  readonly data: SaveSquadTemplateDialogData = inject(MAT_DIALOG_DATA);

  modeCtrl = new FormControl<'create' | 'overwrite'>('create');
  nameCtrl = new FormControl<string>('', [
    Validators.required,
    Validators.minLength(2),
  ]);
  squadIdCtrl = new FormControl<string | null>(null, Validators.required);

  get isValid(): boolean {
    if (this.modeCtrl.value === 'create') return this.nameCtrl.valid;
    return this.squadIdCtrl.valid;
  }

  onSave(): void {
    if (!this.isValid) return;
    const result: SaveSquadTemplateDialogResult =
      this.modeCtrl.value === 'create'
        ? { mode: 'create', name: this.nameCtrl.value! }
        : { mode: 'overwrite', squadId: this.squadIdCtrl.value! };
    this.dialogRef.close(result);
  }

  onCancel(): void {
    this.dialogRef.close(null);
  }
}
