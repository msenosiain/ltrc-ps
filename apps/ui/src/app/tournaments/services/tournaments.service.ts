import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Tournament } from '@ltrc-ps/shared-api-model';
import { API_CONFIG_TOKEN } from '../../app.config';

export interface TournamentFormValue {
  name: string;
  season?: string;
  description?: string;
}

@Injectable({
  providedIn: 'root',
})
export class TournamentsService {
  private readonly httpClient = inject(HttpClient);
  private readonly config = inject(API_CONFIG_TOKEN);
  private readonly tournamentsApiUrl = `${this.config.baseUrl}/tournaments`;

  getTournaments(): Observable<Tournament[]> {
    return this.httpClient.get<Tournament[]>(this.tournamentsApiUrl);
  }

  getTournamentById(id: string): Observable<Tournament> {
    return this.httpClient.get<Tournament>(`${this.tournamentsApiUrl}/${id}`);
  }

  createTournament(dto: TournamentFormValue): Observable<Tournament> {
    return this.httpClient.post<Tournament>(this.tournamentsApiUrl, dto);
  }

  updateTournament(id: string, dto: Partial<TournamentFormValue>): Observable<Tournament> {
    return this.httpClient.patch<Tournament>(`${this.tournamentsApiUrl}/${id}`, dto);
  }

  deleteTournament(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.tournamentsApiUrl}/${id}`);
  }
}