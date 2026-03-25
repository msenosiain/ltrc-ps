import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { VideoVisibility } from '@ltrc-campo/shared-api-model';

export interface UploadAttachmentResult {
  file: File;
  name: string;
  visibility: VideoVisibility;
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

  readonly form = this.fb.group({
    name: ['', Validators.required],
    visibility: ['all' as VideoVisibility, Validators.required],
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
    if (this.form.invalid || !this.selectedFile) return;
    this.dialogRef.close({
      file: this.selectedFile,
      name: this.form.get('name')!.value,
      visibility: this.form.get('visibility')!.value,
    } as UploadAttachmentResult);
  }

  cancel(): void {
    this.dialogRef.close();
  }
}
