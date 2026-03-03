import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { CategoryEnum, SortOrder, SportEnum, Tournament } from '@ltrc-ps/shared-api-model';
import { API_CONFIG_TOKEN } from '../../app.config';

export interface TournamentFormValue {
  name: string;
  season?: string;
  description?: string;
  sport?: SportEnum | null;
  categories?: CategoryEnum[];
}

@Injectable({
  providedIn: 'root',
})
export class TournamentsService {
  private readonly httpClient = inject(HttpClient);
  private readonly config = inject(API_CONFIG_TOKEN);
  private readonly tournamentsApiUrl = `${this.config.baseUrl}/tournaments`;

  getTournaments(searchTerm?: string, sport?: SportEnum, sortBy?: string, sortOrder?: SortOrder): Observable<Tournament[]> {
    let params = new HttpParams();
    if (searchTerm) params = params.set('searchTerm', searchTerm);
    if (sport) params = params.set('sport', sport);
    if (sortBy) params = params.set('sortBy', sortBy);
    if (sortOrder) params = params.set('sortOrder', sortOrder);
    return this.httpClient.get<Tournament[]>(this.tournamentsApiUrl, { params });
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