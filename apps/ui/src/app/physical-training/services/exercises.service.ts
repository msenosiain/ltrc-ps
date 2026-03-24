import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Exercise, PaginatedResponse, PaginationQuery } from '@ltrc-campo/shared-api-model';
import { API_CONFIG_TOKEN } from '../../app.config';

@Injectable({ providedIn: 'root' })
export class ExercisesService {
  private readonly httpClient = inject(HttpClient);
  private readonly config = inject(API_CONFIG_TOKEN);
  private readonly apiUrl = `${this.config.baseUrl}/exercises`;

  getExercises(query: PaginationQuery): Observable<PaginatedResponse<Exercise>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.size) params = params.set('size', query.size);
    if (query.filters && Object.keys(query.filters).length > 0)
      params = params.set('filters', JSON.stringify(query.filters));
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.sortOrder) params = params.set('sortOrder', query.sortOrder);
    return this.httpClient.get<PaginatedResponse<Exercise>>(this.apiUrl, { params });
  }

  getExerciseById(id: string): Observable<Exercise> {
    return this.httpClient.get<Exercise>(`${this.apiUrl}/${id}`);
  }

  createExercise(dto: Partial<Exercise>): Observable<Exercise> {
    return this.httpClient.post<Exercise>(this.apiUrl, dto);
  }

  updateExercise(id: string, dto: Partial<Exercise>): Observable<Exercise> {
    return this.httpClient.patch<Exercise>(`${this.apiUrl}/${id}`, dto);
  }

  deleteExercise(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }

  getAllForAutocomplete(): Observable<PaginatedResponse<Exercise>> {
    return this.getExercises({ page: 1, size: 500, sortBy: 'name', sortOrder: 'asc' as any });
  }
}
