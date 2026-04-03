import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG_TOKEN } from '../../app.config';

export interface GrowthStats {
  labels: string[];
  rugby: { altas: number[]; bajas: number[] };
  hockey: { altas: number[]; bajas: number[] };
}

export interface AgeDistribution {
  all: { birthYear: number; count: number }[];
  rugby: { birthYear: number; count: number }[];
  hockey: { birthYear: number; count: number }[];
}

export interface AttendanceTrend {
  labels: string[];
  sessions: number[];
  present: number[];
  attendees: number[];
  pct: number[];
}

export interface ParticipationOverlap {
  labels: string[];
  trainOnly: number[];
  matchOnly: number[];
  both: number[];
}

export interface MatchTrend {
  labels: string[];
  matches: number[];
  present: number[];
  attendees: number[];
  pct: number[];
}

export interface NonCompCategoryTrend {
  category: string;
  labels: string[];
  trainOnly: number[];
  both: number[];
  matchOnly: number[];
  trainPresent: number[];
  trainAttendees: number[];
  matchPresent: number[];
  matchAttendees: number[];
}

export interface NonCompByCategory {
  categories: NonCompCategoryTrend[];
}

export interface PaymentStats {
  byMethod: { mp: number; cash: number };
  mpAdoptionPct: number;
  activePendingLinks: number;
  recentEvents: {
    linkId: string;
    concept: string;
    entityType: string;
    label: string;
    approved: number;
    pending: number;
    createdAt: string;
  }[];
}

@Injectable({ providedIn: 'root' })
export class AnalyticsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG_TOKEN);
  private readonly base = this.config.baseUrl;

  getPlayerGrowth(period = '6m', sport?: string): Observable<GrowthStats> {
    let params = new HttpParams().set('period', period);
    if (sport) params = params.set('sport', sport);
    return this.http.get<GrowthStats>(`${this.base}/players/stats/growth`, { params });
  }

  getAgeDistribution(): Observable<AgeDistribution> {
    return this.http.get<AgeDistribution>(`${this.base}/players/stats/age-distribution`);
  }

  getTrainingTrend(period = '6m', sport?: string, categoryGroup?: 'competitive' | 'non-competitive'): Observable<AttendanceTrend> {
    let params = new HttpParams().set('period', period);
    if (sport) params = params.set('sport', sport);
    if (categoryGroup) params = params.set('categoryGroup', categoryGroup);
    return this.http.get<AttendanceTrend>(`${this.base}/training-sessions/stats/trend`, { params });
  }

  getMatchTrend(period = '6m', sport?: string, categoryGroup?: 'competitive' | 'non-competitive'): Observable<MatchTrend> {
    let params = new HttpParams().set('period', period);
    if (sport) params = params.set('sport', sport);
    if (categoryGroup) params = params.set('categoryGroup', categoryGroup);
    return this.http.get<MatchTrend>(`${this.base}/matches/stats/trend`, { params });
  }

  getParticipationOverlap(period = '6m', sport?: string): Observable<ParticipationOverlap> {
    let params = new HttpParams().set('period', period);
    if (sport) params = params.set('sport', sport);
    return this.http.get<ParticipationOverlap>(`${this.base}/training-sessions/stats/participation-overlap`, { params });
  }

  getNonCompetitiveByCategory(period = '6m', sport?: string): Observable<NonCompByCategory> {
    let params = new HttpParams().set('period', period);
    if (sport) params = params.set('sport', sport);
    return this.http.get<NonCompByCategory>(`${this.base}/training-sessions/stats/non-competitive-by-category`, { params });
  }

  getPaymentStats(sport?: string): Observable<PaymentStats> {
    let params = new HttpParams();
    if (sport) params = params.set('sport', sport);
    return this.http.get<PaymentStats>(`${this.base}/payments/stats`, { params });
  }
}
