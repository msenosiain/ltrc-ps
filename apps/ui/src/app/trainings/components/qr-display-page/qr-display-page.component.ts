import {
  Component,
  OnInit,
  OnDestroy,
  inject,
  signal,
  ElementRef,
  viewChild,
} from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { DatePipe } from '@angular/common';
import { TrainingSessionsService } from '../../services/training-sessions.service';
import * as QRCode from 'qrcode';

@Component({
  selector: 'ltrc-qr-display-page',
  standalone: true,
  imports: [MatButtonModule, MatIconModule, MatProgressSpinnerModule, DatePipe],
  templateUrl: './qr-display-page.component.html',
  styleUrl: './qr-display-page.component.scss',
})
export class QrDisplayPageComponent implements OnInit, OnDestroy {
  private readonly route = inject(ActivatedRoute);
  private readonly sessionsService = inject(TrainingSessionsService);

  readonly canvas = viewChild<ElementRef<HTMLCanvasElement>>('qrCanvas');

  loading = signal(true);
  error = signal<string | null>(null);
  validFrom = signal<string | null>(null);
  validUntil = signal<string | null>(null);
  secondsLeft = signal<number>(0);

  private sessionId = '';
  private refreshInterval?: ReturnType<typeof setInterval>;
  private countdownInterval?: ReturnType<typeof setInterval>;

  ngOnInit(): void {
    this.sessionId = this.route.snapshot.paramMap.get('id') ?? '';
    this.loadQr();
    this.refreshInterval = setInterval(() => this.loadQr(), 55_000);
  }

  ngOnDestroy(): void {
    clearInterval(this.refreshInterval);
    clearInterval(this.countdownInterval);
  }

  private startCountdown(): void {
    clearInterval(this.countdownInterval);
    this.secondsLeft.set(55);
    this.countdownInterval = setInterval(() => {
      const next = this.secondsLeft() - 1;
      if (next <= 0) {
        clearInterval(this.countdownInterval);
      }
      this.secondsLeft.set(next);
    }, 1000);
  }

  loadQr(): void {
    this.loading.set(true);
    this.error.set(null);

    this.sessionsService.getCheckinToken(this.sessionId).subscribe({
      next: ({ token, validFrom, validUntil }) => {
        this.validFrom.set(validFrom);
        this.validUntil.set(validUntil);

        const checkinUrl = `${window.location.origin}/checkin/${this.sessionId}?token=${token}`;

        setTimeout(() => {
          const canvasEl = this.canvas()?.nativeElement;
          if (!canvasEl) return;
          QRCode.toCanvas(canvasEl, checkinUrl, { width: 320, margin: 2 }, (err) => {
            if (err) {
              this.error.set('No se pudo generar el QR');
            } else {
              this.startCountdown();
            }
            this.loading.set(false);
          });
        });
      },
      error: () => {
        this.error.set('Error al obtener el token');
        this.loading.set(false);
      },
    });
  }
}
