import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { API_CONFIG_TOKEN } from '../../app.config';
import {
  IPayment,
  IPaymentLink,
  IPaymentLinkPublicInfo,
  PaymentEntityTypeEnum,
} from '@ltrc-campo/shared-api-model';

export interface FeePreview {
  mpFeeRate: number;
  grossAmount: number;
  mpFeeAmount: number;
  netAmount: number;
}

export interface CreatePaymentLinkPayload {
  entityType: PaymentEntityTypeEnum;
  entityId?: string;
  entityIds?: string[];
  concept: string;
  description?: string;
  amount: number;
  paymentType: string;
  installmentNumber?: number;
  installmentTotal?: number;
  expiresAt: string;
}

export interface RecordManualPaymentPayload {
  entityType: PaymentEntityTypeEnum;
  entityId: string;
  playerId: string;
  amount: number;
  method: string;
  concept: string;
  date: string;
  notes?: string;
}

export interface ValidateResult {
  playerId: string;
  playerName: string;
}

export interface CheckoutResult {
  checkoutUrl: string;
}

export interface EncounterPaymentRow {
  playerName: string;
  playerDni: string;
  concept: string;
  method: string;
  amount: number;
  date: string;
}

export interface EncounterCategorySummary {
  category: string;
  categoryLabel: string;
  count: number;
  total: number;
  payments: EncounterPaymentRow[];
}

export interface EncounterReport {
  encounterLabel: string;
  date: string;
  time?: string;
  opponent?: string;
  categories: EncounterCategorySummary[];
  grandTotal: number;
  grandCount: number;
}

export interface ConfirmResult {
  status: string;
}

@Injectable({ providedIn: 'root' })
export class PaymentsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG_TOKEN);
  private readonly apiUrl = `${this.config.baseUrl}/payments`;

  // ── Links ─────────────────────────────────────────────────────────────────

  createLink(payload: CreatePaymentLinkPayload) {
    return this.http.post<IPaymentLink>(`${this.apiUrl}/links`, payload);
  }

  getLinks(entityType: PaymentEntityTypeEnum, entityId: string) {
    const params = new HttpParams()
      .set('entityType', entityType)
      .set('entityId', entityId);
    return this.http.get<IPaymentLink[]>(`${this.apiUrl}/links`, { params });
  }

  cancelLink(id: string) {
    return this.http.delete<IPaymentLink>(`${this.apiUrl}/links/${id}`);
  }

  getConfig() {
    return this.http.get<{ mpFeeRate: number }>(`${this.apiUrl}/config`);
  }

  getFieldOptions() {
    return this.http.get<{ concepts: string[] }>(`${this.apiUrl}/field-options`);
  }

  getFeePreview(amount: number) {
    const params = new HttpParams().set('amount', String(amount));
    return this.http.get<FeePreview>(`${this.apiUrl}/fee-preview`, { params });
  }

  // ── Pagos ─────────────────────────────────────────────────────────────────

  getPayments(entityType: PaymentEntityTypeEnum, entityId: string) {
    const params = new HttpParams()
      .set('entityType', entityType)
      .set('entityId', entityId);
    return this.http.get<IPayment[]>(`${this.apiUrl}`, { params });
  }

  recordManual(payload: RecordManualPaymentPayload) {
    return this.http.post<IPayment>(`${this.apiUrl}`, payload);
  }

  deleteManual(id: string) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  downloadPdfReport(entityType: PaymentEntityTypeEnum, entityId: string) {
    const params = new HttpParams()
      .set('entityType', entityType)
      .set('entityId', entityId);
    return this.http.get(`${this.apiUrl}/report/pdf`, {
      params,
      responseType: 'blob',
    });
  }

  getEncounterReport(matchIds: string[]) {
    const params = new HttpParams().set('matchIds', matchIds.join(','));
    return this.http.get<EncounterReport>(`${this.apiUrl}/report/encounter`, { params });
  }

  downloadEncounterPdf(matchIds: string[]) {
    const params = new HttpParams().set('matchIds', matchIds.join(','));
    return this.http.get(`${this.apiUrl}/report/encounter/pdf`, {
      params,
      responseType: 'blob',
    });
  }

  // ── Públicos ──────────────────────────────────────────────────────────────

  getPublicLinkInfo(token: string) {
    return this.http.get<IPaymentLinkPublicInfo>(
      `${this.apiUrl}/public/links/${token}`
    );
  }

  validateDni(token: string, dni: string) {
    return this.http.post<ValidateResult>(
      `${this.apiUrl}/public/links/${token}/validate`,
      { dni }
    );
  }

  initiateCheckout(token: string, dni: string) {
    return this.http.post<CheckoutResult>(
      `${this.apiUrl}/public/links/${token}/checkout`,
      { dni }
    );
  }

  findPlayerByDni(dni: string) {
    return this.http.get<ValidateResult>(`${this.apiUrl}/internal/players/by-dni/${dni}`);
  }

  confirmPayment(externalReference: string, paymentId?: string, status?: string) {
    return this.http.post<ConfirmResult>(`${this.apiUrl}/public/confirm`, {
      externalReference,
      paymentId,
      status,
    });
  }
}
