import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PaginatedResponse,
  PaginationQuery,
  TrainingSession,
  UpcomingTraining,
} from '@ltrc-campo/shared-api-model';
import { API_CONFIG_TOKEN } from '../../app.config';

@Injectable({
  providedIn: 'root',
})
export class TrainingSessionsService {
  private readonly httpClient = inject(HttpClient);
  private readonly config = inject(API_CONFIG_TOKEN);
  private readonly apiUrl = `${this.config.baseUrl}/training-sessions`;

  getSessions(
    query: PaginationQuery
  ): Observable<PaginatedResponse<TrainingSession>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.size) params = params.set('size', query.size);
    if (query.filters && Object.keys(query.filters).length > 0)
      params = params.set('filters', JSON.stringify(query.filters));
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.sortOrder) params = params.set('sortOrder', query.sortOrder);

    return this.httpClient.get<PaginatedResponse<TrainingSession>>(
      this.apiUrl,
      { params }
    );
  }

  getSessionById(id: string): Observable<TrainingSession> {
    return this.httpClient.get<TrainingSession>(`${this.apiUrl}/${id}`);
  }

  getUpcomingForCurrentUser(days = 7): Observable<UpcomingTraining[]> {
    const params = new HttpParams().set('days', days);
    return this.httpClient.get<UpcomingTraining[]>(`${this.apiUrl}/upcoming`, {
      params,
    });
  }

  confirmAttendance(
    sessionId?: string,
    scheduleId?: string,
    date?: string
  ): Observable<TrainingSession> {
    const id = sessionId ?? 'virtual';
    return this.httpClient.post<TrainingSession>(
      `${this.apiUrl}/${id}/confirm`,
      { scheduleId, date }
    );
  }

  cancelConfirmation(sessionId: string): Observable<TrainingSession> {
    return this.httpClient.delete<TrainingSession>(
      `${this.apiUrl}/${sessionId}/confirm`
    );
  }

  recordAttendance(
    sessionId: string,
    records: {
      playerId?: string;
      userId?: string;
      isStaff: boolean;
      status: string;
    }[]
  ): Observable<TrainingSession> {
    return this.httpClient.patch<TrainingSession>(
      `${this.apiUrl}/${sessionId}/attendance`,
      { records }
    );
  }

  updateSession(
    id: string,
    data: { startTime?: string; endTime?: string; location?: string; notes?: string; status?: string }
  ): Observable<TrainingSession> {
    return this.httpClient.patch<TrainingSession>(`${this.apiUrl}/${id}`, data);
  }

  deleteSession(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }
}
