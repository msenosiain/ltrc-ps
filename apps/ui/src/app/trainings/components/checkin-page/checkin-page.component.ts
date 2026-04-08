import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { TrainingSessionsService } from '../../services/training-sessions.service';

type PageState = 'confirming' | 'loading' | 'success' | 'error';

@Component({
  selector: 'ltrc-checkin-page',
  standalone: true,
  imports: [MatCardModule, MatButtonModule, MatIconModule, MatProgressSpinnerModule],
  templateUrl: './checkin-page.component.html',
  styleUrl: './checkin-page.component.scss',
})
export class CheckinPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sessionsService = inject(TrainingSessionsService);

  state = signal<PageState>('confirming');
  errorMessage = signal<string>('Error al registrar asistencia');

  private sessionId = '';
  private token = '';

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.paramMap.get('sessionId') ?? '';
    this.token = this.route.snapshot.queryParamMap.get('token') ?? '';

    if (!this.sessionId || !this.token) {
      this.errorMessage.set('El enlace de check-in es inválido');
      this.state.set('error');
    }
  }

  confirm(): void {
    this.state.set('loading');
    this.sessionsService.checkin(this.sessionId, this.token).subscribe({
      next: () => this.state.set('success'),
      error: (err) => {
        const msg = err?.error?.message;
        this.errorMessage.set(msg ?? 'Error al registrar asistencia');
        this.state.set('error');
      },
    });
  }

  goToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }
}
