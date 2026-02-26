import { Component, inject } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ltrc-player-photo-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './player-photo-dialog.component.html',
  styleUrl: './player-photo-dialog.component.scss',
})
export class PlayerPhotoDialogComponent {
  private dialogRef = inject(MatDialogRef<PlayerPhotoDialogComponent>);

  // Inyectado por el padre via MatDialog.open({ data: ... })
  hasCurrentPhoto = false;
  previewUrl: string | null = null;
  file?: File;

  onFileChange(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    if (!file) return;

    this.file = file;
    const reader = new FileReader();
    reader.onload = () => (this.previewUrl = reader.result as string);
    reader.readAsDataURL(file);
  }

  confirm(): void {
    if (!this.file) return;
    this.dialogRef.close({
      action: 'select',
      file: this.file,
      previewUrl: this.previewUrl,
    });
  }

  remove(): void {
    this.dialogRef.close({ action: 'remove' });
  }

  close(): void {
    this.dialogRef.close();
  }
}
