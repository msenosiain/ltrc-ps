import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { PaymentsService } from '../../services/payments.service';

type ResultState = 'confirming' | 'approved' | 'pending' | 'rejected' | 'error';

@Component({
  selector: 'ltrc-payment-result',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatProgressSpinnerModule,
  ],
  templateUrl: './payment-result.component.html',
  styleUrl: './payment-result.component.scss',
})
export class PaymentResultComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly paymentsService = inject(PaymentsService);

  state: ResultState = 'confirming';

  ngOnInit() {
    const params = this.route.snapshot.queryParams;
    const externalReference: string = params['external_reference'] ?? '';
    const paymentId: string | undefined = params['payment_id'];
    const status: string | undefined = params['status'];

    if (!externalReference) {
      this.state = 'error';
      return;
    }

    this.paymentsService.confirmPayment(externalReference, paymentId, status).subscribe({
      next: (result) => {
        switch (result.status) {
          case 'approved':
            this.state = 'approved';
            break;
          case 'in_process':
          case 'pending':
            this.state = 'pending';
            break;
          case 'rejected':
            this.state = 'rejected';
            break;
          default:
            this.state = 'error';
        }
      },
      error: () => {
        this.state = 'error';
      },
    });
  }
}
