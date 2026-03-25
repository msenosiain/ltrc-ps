import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CalendarEvent } from '@ltrc-campo/shared-api-model';
import { API_CONFIG_TOKEN } from '../../app.config';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG_TOKEN);
  private readonly apiUrl = `${this.config.baseUrl}/calendar`;

  getEvents(fromDate: string, toDate: string): Observable<CalendarEvent[]> {
    const params = new HttpParams().set('fromDate', fromDate).set('toDate', toDate);
    return this.http.get<CalendarEvent[]>(this.apiUrl, { params });
  }
}
