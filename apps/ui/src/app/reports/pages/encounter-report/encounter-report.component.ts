import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDividerModule } from '@angular/material/divider';
import { HttpClient, HttpParams } from '@angular/common/http';
import {
  Match,
  PaginatedResponse,
  Tournament,
} from '@ltrc-campo/shared-api-model';
import { API_CONFIG_TOKEN } from '../../../app.config';
import { PaymentsService } from '../../../payments/services/payments.service';
import { format } from 'date-fns';

interface EncounterGroup {
  label: string;
  date: string;
  time?: string;
  opponent?: string;
  matchIds: string[];
}

interface CategorySummary {
  category: string;
  categoryLabel: string;
  count: number;
  total: number;
}

interface EncounterReport {
  encounterLabel: string;
  categories: CategorySummary[];
  grandTotal: number;
  grandCount: number;
}

@Component({
  selector: 'ltrc-encounter-report',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatButtonModule,
    MatIconModule,
    MatDatepickerModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDividerModule,
  ],
  templateUrl: './encounter-report.component.html',
  styleUrl: './encounter-report.component.scss',
})
export class EncounterReportComponent implements OnInit {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG_TOKEN);
  private readonly paymentsService = inject(PaymentsService);
  private readonly snackBar = inject(MatSnackBar);

  private readonly tournamentsApiUrl = `${this.config.baseUrl}/tournaments`;
  private readonly matchesApiUrl = `${this.config.baseUrl}/matches`;

  tournaments = signal<Tournament[]>([]);
  encounters = signal<EncounterGroup[]>([]);
  report = signal<EncounterReport | null>(null);
  selectedEncounter = signal<EncounterGroup | null>(null);

  loadingTournaments = signal(false);
  loadingEncounters = signal(false);
  loadingReport = signal(false);

  readonly filterForm = new FormGroup({
    tournament: new FormControl<string>('', Validators.required),
    date: new FormControl<Date | null>(null),
  });

  readonly categoryColumns = ['categoryLabel', 'count', 'total'];

  ngOnInit() {
    this.loadTournaments();
  }

  private loadTournaments() {
    this.loadingTournaments.set(true);
    const params = new HttpParams().set('size', '200').set('page', '1');
    this.http.get<PaginatedResponse<Tournament>>(this.tournamentsApiUrl, { params }).subscribe({
      next: (res) => {
        this.tournaments.set(res.items);
        this.loadingTournaments.set(false);
      },
      error: () => this.loadingTournaments.set(false),
    });
  }

  searchEncounters() {
    const { tournament, date } = this.filterForm.value;
    if (!tournament) return;

    this.loadingEncounters.set(true);
    this.encounters.set([]);
    this.report.set(null);
    this.selectedEncounter.set(null);

    let params = new HttpParams()
      .set('filters', JSON.stringify({ tournament }))
      .set('size', '200')
      .set('page', '1')
      .set('sortBy', 'date')
      .set('sortOrder', 'desc');

    if (date) {
      const dateStr = format(date, 'yyyy-MM-dd');
      const existing = JSON.parse(params.get('filters') || '{}');
      params = params.set('filters', JSON.stringify({ ...existing, fromDate: dateStr, toDate: dateStr }));
    }

    this.http.get<PaginatedResponse<Match>>(this.matchesApiUrl, { params }).subscribe({
      next: (res) => {
        this.encounters.set(this.groupMatchesToEncounters(res.items));
        this.loadingEncounters.set(false);
      },
      error: () => this.loadingEncounters.set(false),
    });
  }

  private groupMatchesToEncounters(matches: Match[]): EncounterGroup[] {
    const groups = new Map<string, EncounterGroup>();
    for (const m of matches) {
      const key = `${m.date?.toString().substring(0, 10)}_${m.opponent ?? ''}_${m.name ?? ''}`;
      if (!groups.has(key)) {
        const label = m.name || (m.opponent ? `vs ${m.opponent}` : format(new Date(m.date), 'dd/MM/yyyy'));
        groups.set(key, {
          label,
          date: format(new Date(m.date), 'dd/MM/yyyy'),
          time: m.time || undefined,
          opponent: m.opponent || undefined,
          matchIds: [],
        });
      }
      groups.get(key)!.matchIds.push(m.id!);
    }
    return Array.from(groups.values());
  }

  selectEncounter(encounter: EncounterGroup) {
    this.selectedEncounter.set(encounter);
    this.report.set(null);
    this.loadingReport.set(true);
    this.paymentsService.getEncounterReport(encounter.matchIds).subscribe({
      next: (data) => {
        this.report.set(data);
        this.loadingReport.set(false);
      },
      error: () => {
        this.snackBar.open('Error al cargar el informe', '', { duration: 3000 });
        this.loadingReport.set(false);
      },
    });
  }

  clearAll() {
    this.filterForm.reset();
    this.encounters.set([]);
    this.report.set(null);
    this.selectedEncounter.set(null);
  }

  downloadPdf() {
    const encounter = this.selectedEncounter();
    if (!encounter) return;
    this.paymentsService.downloadEncounterPdf(encounter.matchIds).subscribe({
      next: (blob) => {
        const url = URL.createObjectURL(blob as Blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `informe-encuentro-${encounter.date.replace(/\//g, '-')}.pdf`;
        a.click();
        URL.revokeObjectURL(url);
      },
      error: () => this.snackBar.open('Error al generar el PDF', '', { duration: 3000 }),
    });
  }
}
