import { Component, inject } from '@angular/core';
import { MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

@Component({
  selector: 'ltrc-player-photo-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  template: `
    <h2 mat-dialog-title>Foto del jugador</h2>

    <mat-dialog-content>
      <div class="preview-area">
        @if (previewUrl) {
        <img [src]="previewUrl" alt="Preview" class="preview-img" />
        } @else {
        <div class="preview-placeholder">
          <span>Sin imagen seleccionada</span>
        </div>
        }
      </div>

      <label class="file-label" for="photo-input">
        <mat-icon>upload</mat-icon>
        Elegir imagen
      </label>
      <input
        id="photo-input"
        class="file-input"
        type="file"
        accept="image/*"
        (change)="onFileChange($event)"
      />
    </mat-dialog-content>

    <mat-dialog-actions align="end">
      <button mat-button type="button" (click)="close()">Cancelar</button>
      @if (hasCurrentPhoto) {
      <button mat-button color="warn" type="button" (click)="remove()">
        Quitar foto
      </button>
      }
      <button
        mat-raised-button
        color="primary"
        type="button"
        [disabled]="!file"
        (click)="confirm()"
      >
        Confirmar
      </button>
    </mat-dialog-actions>
  `,
  styles: [
    `
      .preview-area {
        width: 200px;
        height: 200px;
        margin: 0 auto 1rem;
        border-radius: 8px;
        overflow: hidden;
        background: #f5f5f5;
        display: flex;
        align-items: center;
        justify-content: center;
      }

      .preview-img {
        width: 100%;
        height: 100%;
        object-fit: cover;
      }

      .preview-placeholder {
        font-size: 0.85rem;
        color: #9e9e9e;
        text-align: center;
        padding: 1rem;
      }

      .file-input {
        display: none;
      }

      .file-label {
        display: inline-flex;
        align-items: center;
        gap: 6px;
        padding: 0.4rem 1rem;
        border: 1px solid currentColor;
        border-radius: 4px;
        cursor: pointer;
        font-size: 0.875rem;
        margin-bottom: 0.5rem;

        mat-icon {
          font-size: 18px;
          width: 18px;
          height: 18px;
        }
      }
    `,
  ],
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
