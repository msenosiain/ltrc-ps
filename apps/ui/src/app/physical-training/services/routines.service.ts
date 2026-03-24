import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse, PaginationQuery, Routine } from '@ltrc-campo/shared-api-model';
import { API_CONFIG_TOKEN } from '../../app.config';

@Injectable({ providedIn: 'root' })
export class RoutinesService {
  private readonly httpClient = inject(HttpClient);
  private readonly config = inject(API_CONFIG_TOKEN);
  private readonly apiUrl = `${this.config.baseUrl}/routines`;

  getRoutines(query: PaginationQuery): Observable<PaginatedResponse<Routine>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.size) params = params.set('size', query.size);
    if (query.filters && Object.keys(query.filters).length > 0)
      params = params.set('filters', JSON.stringify(query.filters));
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.sortOrder) params = params.set('sortOrder', query.sortOrder);
    return this.httpClient.get<PaginatedResponse<Routine>>(this.apiUrl, { params });
  }

  getRoutineById(id: string): Observable<Routine> {
    return this.httpClient.get<Routine>(`${this.apiUrl}/${id}`);
  }

  getMyRoutines(): Observable<Routine[]> {
    return this.httpClient.get<Routine[]>(`${this.apiUrl}/my`);
  }

  createRoutine(dto: Partial<Routine>): Observable<Routine> {
    return this.httpClient.post<Routine>(this.apiUrl, dto);
  }

  updateRoutine(id: string, dto: Partial<Routine>): Observable<Routine> {
    return this.httpClient.patch<Routine>(`${this.apiUrl}/${id}`, dto);
  }

  deleteRoutine(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }
}
