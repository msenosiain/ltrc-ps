import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  Match,
  PaginatedResponse,
  PaginationQuery,
} from '@ltrc-ps/shared-api-model';
import { API_CONFIG_TOKEN } from '../../app.config';
import { MatchFormValue } from '../forms/match-form.types';
import { mapFormToCreateMatchDto } from '../forms/match-form.mapper';
import { matchStatusOptions, matchTypeOptions } from '../match-options';
import { MatchStatusEnum, MatchTypeEnum } from '@ltrc-ps/shared-api-model';

@Injectable({
  providedIn: 'root',
})
export class MatchesService {
  private readonly httpClient = inject(HttpClient);
  private readonly config = inject(API_CONFIG_TOKEN);
  private readonly matchesApiUrl = `${this.config.baseUrl}/matches`;

  getFieldOptions(): Observable<{
    opponents: string[];
    venues: string[];
    divisions: string[];
  }> {
    return this.httpClient.get<{
      opponents: string[];
      venues: string[];
      divisions: string[];
    }>(`${this.matchesApiUrl}/field-options`);
  }

  getMatches(query: PaginationQuery): Observable<PaginatedResponse<Match>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.size) params = params.set('size', query.size);
    if (query.filters && Object.keys(query.filters).length > 0)
      params = params.set('filters', JSON.stringify(query.filters));
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.sortOrder) params = params.set('sortOrder', query.sortOrder);

    return this.httpClient.get<PaginatedResponse<Match>>(this.matchesApiUrl, {
      params,
    });
  }

  getMatchById(id: string): Observable<Match> {
    return this.httpClient.get<Match>(`${this.matchesApiUrl}/${id}`);
  }

  createMatch(formValue: MatchFormValue): Observable<Match> {
    const dto = mapFormToCreateMatchDto(formValue);
    return this.httpClient.post<Match>(this.matchesApiUrl, dto);
  }

  updateMatch(id: string, formValue: MatchFormValue): Observable<Match> {
    const dto = mapFormToCreateMatchDto(formValue);
    return this.httpClient.patch<Match>(`${this.matchesApiUrl}/${id}`, dto);
  }

  deleteMatch(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.matchesApiUrl}/${id}`);
  }

  getStatusLabel(status: MatchStatusEnum): string {
    return matchStatusOptions.find((o) => o.id === status)?.label ?? status;
  }

  getTypeLabel(type: MatchTypeEnum): string {
    return matchTypeOptions.find((o) => o.id === type)?.label ?? type;
  }

  updateSquad(
    matchId: string,
    squad: { shirtNumber: number; playerId: string }[]
  ): Observable<Match> {
    return this.httpClient.patch<Match>(
      `${this.matchesApiUrl}/${matchId}/squad`,
      { squad }
    );
  }

  applySquadFromTemplate(matchId: string, squadId: string): Observable<Match> {
    return this.httpClient.post<Match>(
      `${this.matchesApiUrl}/${matchId}/squad/from/${squadId}`,
      {}
    );
  }
}
