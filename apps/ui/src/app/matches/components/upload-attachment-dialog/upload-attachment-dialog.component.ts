import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatchAttachment, SquadEntry, VideoVisibility } from '@ltrc-campo/shared-api-model';

export interface UploadAttachmentDialogData {
  attachment?: MatchAttachment;
  squad: SquadEntry[];
}

export interface UploadAttachmentResult {
  file?: File;
  name: string;
  visibility: VideoVisibility;
  targetPlayers?: string[];
}

@Component({
  selector: 'ltrc-upload-attachment-dialog',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatDialogModule,
    MatButtonModule,
    MatFormFieldModule,
    MatInputModule,
    MatIconModule,
    MatSelectModule,
  ],
  templateUrl: './upload-attachment-dialog.component.html',
  styleUrl: './upload-attachment-dialog.component.scss',
})
export class UploadAttachmentDialogComponent {
  private readonly fb = inject(FormBuilder);
  readonly dialogRef = inject(MatDialogRef<UploadAttachmentDialogComponent>);
  readonly data: UploadAttachmentDialogData = inject(MAT_DIALOG_DATA, { optional: true }) ?? { squad: [] };

  get isEdit(): boolean {
    return !!this.data?.attachment;
  }

  get showPlayerSelect(): boolean {
    return this.form.get('visibility')?.value === 'players';
  }

  readonly form = this.fb.group({
    name: [this.data?.attachment?.name ?? this.data?.attachment?.filename ?? '', Validators.required],
    visibility: [this.data?.attachment?.visibility ?? 'all' as VideoVisibility, Validators.required],
    targetPlayers: [this.data?.attachment?.targetPlayers ?? [] as string[]],
  });

  selectedFile: File | null = null;

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;
    this.selectedFile = file;
    if (!this.form.get('name')!.value) {
      this.form.get('name')!.setValue(file.name.replace(/\.[^.]+$/, ''));
    }
  }

  confirm(): void {
    if (this.form.invalid) return;
    if (!this.isEdit && !this.selectedFile) return;
    const visibility = this.form.get('visibility')!.value as VideoVisibility;
    const targetPlayers = visibility === 'players'
      ? (this.form.get('targetPlayers')!.value ?? [])
      : [];
    this.dialogRef.close({
      file: this.selectedFile ?? undefined,
      name: this.form.get('name')!.value,
      visibility,
      targetPlayers,
    } as UploadAttachmentResult);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
