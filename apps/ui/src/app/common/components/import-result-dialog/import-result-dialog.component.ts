import { Component, inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface ImportResultDialogData {
  title: string;
  successCount: number;
  successLabel: string;
  notFound?: { row: number; dni: string; name: string }[];
  errors?: { row: number; message: string }[];
}

@Component({
  selector: 'ltrc-import-result-dialog',
  standalone: true,
  imports: [MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './import-result-dialog.component.html',
  styleUrl: './import-result-dialog.component.scss',
})
export class ImportResultDialogComponent {
  readonly data = inject<ImportResultDialogData>(MAT_DIALOG_DATA);

  downloadReport(): void {
    const lines: string[] = [];
    lines.push(`${this.data.title}`);
    lines.push(`${this.data.successCount} ${this.data.successLabel}`);
    lines.push('');

    if (this.data.notFound?.length) {
      lines.push(`No encontrados (${this.data.notFound.length}):`);
      lines.push('Fila\tDNI\tNombre');
      for (const item of this.data.notFound) {
        lines.push(`${item.row}\t${item.dni}\t${item.name}`);
      }
      lines.push('');
    }

    if (this.data.errors?.length) {
      lines.push(`Errores (${this.data.errors.length}):`);
      lines.push('Fila\tDetalle');
      for (const item of this.data.errors) {
        lines.push(`${item.row}\t${item.message}`);
      }
    }

    const blob = new Blob([lines.join('\n')], {
      type: 'text/plain;charset=utf-8',
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'resultado-importacion.txt';
    a.click();
    URL.revokeObjectURL(url);
  }
}
