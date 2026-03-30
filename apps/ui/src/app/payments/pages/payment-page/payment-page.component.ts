import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDividerModule } from '@angular/material/divider';
import { MatIconModule } from '@angular/material/icon';
import { PaymentsService } from '../../services/payments.service';
import { IPaymentLinkPublicInfo } from '@ltrc-campo/shared-api-model';

type PageState = 'loading' | 'ready' | 'validating' | 'validated' | 'redirecting' | 'expired' | 'error';

@Component({
  selector: 'ltrc-payment-page',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatProgressSpinnerModule,
    MatDividerModule,
    MatIconModule,
  ],
  templateUrl: './payment-page.component.html',
  styleUrl: './payment-page.component.scss',
})
export class PaymentPageComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly paymentsService = inject(PaymentsService);

  state: PageState = 'loading';
  linkInfo: IPaymentLinkPublicInfo | null = null;
  playerName = '';
  errorMessage = '';

  dniControl = new FormControl('', [
    Validators.required,
    Validators.minLength(6),
    Validators.pattern(/^\d+$/),
  ]);

  ngOnInit() {
    const token = this.route.snapshot.paramMap.get('token') ?? '';
    this.paymentsService.getPublicLinkInfo(token).subscribe({
      next: (info) => {
        this.linkInfo = info;
        this.state = 'ready';
      },
      error: (err) => {
        if (err.status === 410) {
          this.state = 'expired';
          this.errorMessage = err.error?.message ?? 'Este link ha expirado o fue cancelado.';
        } else {
          this.state = 'error';
          this.errorMessage = 'No se pudo cargar la información del cobro.';
        }
      },
    });
  }

  validateDni() {
    if (this.dniControl.invalid || !this.linkInfo) return;
    this.state = 'validating';
    const token = this.route.snapshot.paramMap.get('token') ?? '';
    this.paymentsService.validateDni(token, this.dniControl.value!).subscribe({
      next: (result) => {
        this.playerName = result.playerName;
        this.state = 'validated';
      },
      error: (err) => {
        this.state = 'ready';
        if (err.status === 404) {
          this.dniControl.setErrors({ notFound: true });
        } else {
          this.errorMessage = 'Error al validar el DNI. Intente nuevamente.';
        }
      },
    });
  }

  pay() {
    if (!this.linkInfo) return;
    this.state = 'redirecting';
    const token = this.route.snapshot.paramMap.get('token') ?? '';
    this.paymentsService.initiateCheckout(token, this.dniControl.value!).subscribe({
      next: (result) => {
        window.location.href = result.checkoutUrl;
      },
      error: () => {
        this.state = 'validated';
        this.errorMessage = 'Error al iniciar el pago. Intente nuevamente.';
      },
    });
  }

  get installmentLabel(): string {
    if (!this.linkInfo) return '';
    if (this.linkInfo.installmentNumber && this.linkInfo.installmentTotal) {
      return `Cuota ${this.linkInfo.installmentNumber} de ${this.linkInfo.installmentTotal}`;
    }
    if (this.linkInfo.paymentType === 'partial') return 'Pago parcial';
    return 'Pago total';
  }
}
