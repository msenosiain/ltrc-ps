import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { WorkoutLog, Routine } from '@ltrc-campo/shared-api-model';
import { API_CONFIG_TOKEN } from '../../app.config';

@Injectable({ providedIn: 'root' })
export class WorkoutLogsService {
  private readonly httpClient = inject(HttpClient);
  private readonly config = inject(API_CONFIG_TOKEN);
  private readonly apiUrl = `${this.config.baseUrl}/workout-logs`;
  private readonly routinesUrl = `${this.config.baseUrl}/routines`;

  getWorkoutLogs(params?: any): Observable<{ items: WorkoutLog[]; total: number }> {
    return this.httpClient.get<{ items: WorkoutLog[]; total: number }>(this.apiUrl, { params });
  }

  getMyLogs(): Observable<WorkoutLog[]> {
    return this.httpClient.get<WorkoutLog[]>(`${this.apiUrl}/my`);
  }

  getLogById(id: string): Observable<WorkoutLog> {
    return this.httpClient.get<WorkoutLog>(`${this.apiUrl}/${id}`);
  }

  createLog(dto: { routineId: string; date?: string }): Observable<WorkoutLog> {
    return this.httpClient.post<WorkoutLog>(this.apiUrl, dto);
  }

  updateLog(id: string, dto: Partial<WorkoutLog>): Observable<WorkoutLog> {
    return this.httpClient.patch<WorkoutLog>(`${this.apiUrl}/${id}`, dto);
  }

  deleteLog(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }

  getTodayRoutine(): Observable<Routine | null> {
    return this.httpClient.get<Routine | null>(`${this.routinesUrl}/today`);
  }
}
