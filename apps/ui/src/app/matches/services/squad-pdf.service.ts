import { Injectable } from '@angular/core';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { format } from 'date-fns';
import { Match, SquadEntry } from '@ltrc-campo/shared-api-model';
import { getCategoryLabel } from '../../common/category-options';

@Injectable({ providedIn: 'root' })
export class SquadPdfService {
  private readonly LOGO_PATH = '/logo-ltrc.png';
  private readonly PRIMARY = [30, 30, 30] as [number, number, number];
  private readonly HEADER_BG = [20, 20, 20] as [number, number, number];
  private readonly SECTION_BG = [245, 245, 245] as [number, number, number];

  async generate(match: Match, squadRows: SquadEntry[]): Promise<void> {
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = doc.internal.pageSize.getWidth();

    let y = await this.drawHeader(doc, match, pageW);

    const titulares = squadRows.filter((e) => e.shirtNumber <= 15).sort((a, b) => a.shirtNumber - b.shirtNumber);
    const suplentes = squadRows.filter((e) => e.shirtNumber > 15).sort((a, b) => a.shirtNumber - b.shirtNumber);

    if (titulares.length) {
      y = this.drawSection(doc, 'TITULARES', titulares, y, pageW);
    }
    if (suplentes.length) {
      y = this.drawSection(doc, 'SUPLENTES', suplentes, y + 4, pageW);
    }

    const filename = this.buildFilename(match);
    doc.save(filename);
  }

  private async drawHeader(doc: jsPDF, match: Match, pageW: number): Promise<number> {
    const logoSize = 18;
    const marginL = 14;

    // Load logo
    try {
      const logoBase64 = await this.loadImageAsBase64(this.LOGO_PATH);
      doc.addImage(logoBase64, 'PNG', marginL, 10, logoSize, logoSize);
    } catch {
      // Logo not available, skip
    }

    // Club name
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(...this.PRIMARY);
    doc.text('LOS TORDOS RUGBY CLUB', marginL + logoSize + 5, 17);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(80, 80, 80);
    doc.text('PLANTEL — PARTIDO', marginL + logoSize + 5, 24);

    // Divider
    doc.setDrawColor(200, 200, 200);
    doc.setLineWidth(0.4);
    doc.line(marginL, 32, pageW - marginL, 32);

    // Match data
    const date = match.date ? new Date(match.date) : null;
    const dateStr = date ? format(date, 'dd/MM/yyyy HH:mm') : '—';
    const localidad = match.isHome === true ? 'Local' : match.isHome === false ? 'Visitante' : '—';
    const rival = match.opponent || 'Sin rival';
    const torneo = (match.tournament as any)?.name ?? '—';

    doc.setFontSize(9);
    doc.setTextColor(...this.PRIMARY);

    const col1x = marginL;
    const col2x = pageW / 2;
    let y = 39;
    const lineH = 6;

    const row = (label: string, value: string, x: number, yy: number) => {
      doc.setFont('helvetica', 'bold');
      const labelText = `${label}: `;
      const labelW = doc.getTextWidth(labelText);
      doc.text(labelText, x, yy);
      doc.setFont('helvetica', 'normal');
      doc.text(value, x + labelW, yy);
    };

    row('Fecha', dateStr, col1x, y);
    row('Condición', localidad, col2x, y);
    y += lineH;
    row('Sede', match.venue ?? '—', col1x, y);
    row('Rival', rival, col2x, y);
    y += lineH;
    row('Categoría', getCategoryLabel(match.category) || '—', col1x, y);
    row('División', match.division ?? '—', col2x, y);
    y += lineH;
    row('Torneo', torneo, col1x, y);
    y += lineH;

    doc.setDrawColor(200, 200, 200);
    doc.line(marginL, y + 1, pageW - marginL, y + 1);

    return y + 5;
  }

  private drawSection(doc: jsPDF, title: string, rows: SquadEntry[], startY: number, pageW: number): number {
    const marginL = 14;

    // Section title
    doc.setFillColor(...this.HEADER_BG);
    doc.rect(marginL, startY, pageW - marginL * 2, 7, 'F');
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(255, 255, 255);
    doc.text(title, marginL + 3, startY + 5);

    const tableData = rows.map((e) => [
      String(e.shirtNumber),
      this.formatDni(e.player.idNumber),
      e.player.name ?? '—',
      e.player.clothingSizes?.jersey ?? '—',
      e.player.clothingSizes?.shorts ?? '—',
    ]);

    autoTable(doc, {
      startY: startY + 7,
      head: [['#', 'DNI', 'Nombre', 'Camiseta', 'Short']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [60, 60, 60],
        textColor: 255,
        fontStyle: 'bold',
        fontSize: 8.5,
        halign: 'center',
      },
      bodyStyles: {
        fontSize: 8.5,
        textColor: this.PRIMARY,
        lineColor: [200, 200, 200],
        lineWidth: 0.3,
      },
      alternateRowStyles: {
        fillColor: this.SECTION_BG,
      },
      columnStyles: {
        0: { halign: 'center', cellWidth: 12 },
        1: { halign: 'center', cellWidth: 30 },
        2: { cellWidth: 'auto' },
        3: { halign: 'center', cellWidth: 22 },
        4: { halign: 'center', cellWidth: 22 },
      },
      margin: { left: marginL, right: marginL },
    });

    return (doc as any).lastAutoTable.finalY as number;
  }

  private formatDni(dni: string | undefined): string {
    if (!dni) return '—';
    const clean = dni.replace(/\D/g, '');
    if (clean.length === 8) {
      return `${clean.slice(0, 2)}.${clean.slice(2, 5)}.${clean.slice(5)}`;
    }
    return dni;
  }

  private buildFilename(match: Match): string {
    const division = match.division?.replace(/\s+/g, '-').toLowerCase() ?? 'sin-division';
    const rival = match.opponent?.replace(/\s+/g, '-').toLowerCase() ?? 'sin-rival';
    const date = match.date ? format(new Date(match.date), 'yyyyMMdd') : 'sin-fecha';
    return `${division}-${rival}-${date}.pdf`;
  }

  private loadImageAsBase64(url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.crossOrigin = 'anonymous';
      img.onload = () => {
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d')!.drawImage(img, 0, 0);
        resolve(canvas.toDataURL('image/png'));
      };
      img.onerror = reject;
      img.src = url;
    });
  }
}
