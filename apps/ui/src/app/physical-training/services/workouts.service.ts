import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PaginatedResponse, PaginationQuery, Workout } from '@ltrc-campo/shared-api-model';
import { API_CONFIG_TOKEN } from '../../app.config';

@Injectable({ providedIn: 'root' })
export class WorkoutsService {
  private readonly httpClient = inject(HttpClient);
  private readonly config = inject(API_CONFIG_TOKEN);
  private readonly apiUrl = `${this.config.baseUrl}/workouts`;

  getWorkouts(query: PaginationQuery): Observable<PaginatedResponse<Workout>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.size) params = params.set('size', query.size);
    if (query.filters && Object.keys(query.filters).length > 0)
      params = params.set('filters', JSON.stringify(query.filters));
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.sortOrder) params = params.set('sortOrder', query.sortOrder);
    return this.httpClient.get<PaginatedResponse<Workout>>(this.apiUrl, { params });
  }

  getWorkoutById(id: string): Observable<Workout> {
    return this.httpClient.get<Workout>(`${this.apiUrl}/${id}`);
  }

  getMyWorkouts(): Observable<Workout[]> {
    return this.httpClient.get<Workout[]>(`${this.apiUrl}/my`);
  }

  createWorkout(dto: Partial<Workout>): Observable<Workout> {
    return this.httpClient.post<Workout>(this.apiUrl, dto);
  }

  updateWorkout(id: string, dto: Partial<Workout>): Observable<Workout> {
    return this.httpClient.patch<Workout>(`${this.apiUrl}/${id}`, dto);
  }

  deleteWorkout(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }

  cloneWorkout(id: string): Observable<Workout> {
    return this.httpClient.post<Workout>(`${this.apiUrl}/${id}/clone`, {});
  }
}
