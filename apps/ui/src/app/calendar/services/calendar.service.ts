import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CalendarEvent, CategoryEnum, SportEnum } from '@ltrc-campo/shared-api-model';
import { API_CONFIG_TOKEN } from '../../app.config';

@Injectable({ providedIn: 'root' })
export class CalendarService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG_TOKEN);
  private readonly apiUrl = `${this.config.baseUrl}/calendar`;

  getEvents(fromDate: string, toDate: string, sport?: SportEnum, category?: CategoryEnum): Observable<CalendarEvent[]> {
    let params = new HttpParams().set('fromDate', fromDate).set('toDate', toDate);
    if (sport) params = params.set('sport', sport);
    if (category) params = params.set('category', category);
    return this.http.get<CalendarEvent[]>(this.apiUrl, { params });
  }
}
