import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PaginatedResponse,
  PaginationQuery,
  TrainingSchedule,
  UpcomingTraining,
} from '@ltrc-campo/shared-api-model';
import { API_CONFIG_TOKEN } from '../../app.config';
import { ScheduleFormValue } from '../forms/schedule-form.types';
import { mapFormToCreateScheduleDto } from '../forms/schedule-form.mapper';

@Injectable({
  providedIn: 'root',
})
export class TrainingSchedulesService {
  private readonly httpClient = inject(HttpClient);
  private readonly config = inject(API_CONFIG_TOKEN);
  private readonly apiUrl = `${this.config.baseUrl}/training-schedules`;

  getSchedules(
    query: PaginationQuery
  ): Observable<PaginatedResponse<TrainingSchedule>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.size) params = params.set('size', query.size);
    if (query.filters && Object.keys(query.filters).length > 0)
      params = params.set('filters', JSON.stringify(query.filters));
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.sortOrder) params = params.set('sortOrder', query.sortOrder);

    return this.httpClient.get<PaginatedResponse<TrainingSchedule>>(
      this.apiUrl,
      { params }
    );
  }

  getScheduleById(id: string): Observable<TrainingSchedule> {
    return this.httpClient.get<TrainingSchedule>(`${this.apiUrl}/${id}`);
  }

  createSchedule(formValue: ScheduleFormValue): Observable<TrainingSchedule> {
    const dto = mapFormToCreateScheduleDto(formValue);
    return this.httpClient.post<TrainingSchedule>(this.apiUrl, dto);
  }

  updateSchedule(
    id: string,
    formValue: ScheduleFormValue
  ): Observable<TrainingSchedule> {
    const dto = mapFormToCreateScheduleDto(formValue);
    return this.httpClient.patch<TrainingSchedule>(`${this.apiUrl}/${id}`, dto);
  }

  deleteSchedule(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.apiUrl}/${id}`);
  }

  getUpcoming(from: string, to: string): Observable<UpcomingTraining[]> {
    const params = new HttpParams().set('from', from).set('to', to);
    return this.httpClient.get<UpcomingTraining[]>(`${this.apiUrl}/upcoming`, {
      params,
    });
  }

  getFieldOptions(): Observable<{
    locations: string[];
    divisions: string[];
  }> {
    return this.httpClient.get<{
      locations: string[];
      divisions: string[];
    }>(`${this.apiUrl}/field-options`);
  }
}
