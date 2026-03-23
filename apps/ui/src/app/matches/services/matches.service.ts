import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  AttendanceStatusEnum,
  Match,
  MatchAttachment,
  PaginatedResponse,
  PaginationQuery,
  VideoClip,
  VideoVisibility,
} from '@ltrc-campo/shared-api-model';
import { API_CONFIG_TOKEN } from '../../app.config';
import { MatchFormValue } from '../forms/match-form.types';
import { mapFormToCreateMatchDto } from '../forms/match-form.mapper';
import { matchStatusOptions } from '../match-options';
import { MatchStatusEnum } from '@ltrc-campo/shared-api-model';

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

  getMySquadMatches(query: PaginationQuery): Observable<PaginatedResponse<Match>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.size) params = params.set('size', query.size);
    if (query.filters && Object.keys(query.filters).length > 0)
      params = params.set('filters', JSON.stringify(query.filters));
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.sortOrder) params = params.set('sortOrder', query.sortOrder);

    return this.httpClient.get<PaginatedResponse<Match>>(`${this.matchesApiUrl}/my-squad`, { params });
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

  updateSquad(
    matchId: string,
    squad: { shirtNumber: number; playerId: string }[]
  ): Observable<Match> {
    return this.httpClient.patch<Match>(
      `${this.matchesApiUrl}/${matchId}/squad`,
      { squad }
    );
  }

  getAttachmentUrl(matchId: string, fileId: string): string {
    return `${this.matchesApiUrl}/${matchId}/attachments/${fileId}`;
  }

  addVideo(matchId: string, dto: { url: string; name: string; description?: string; visibility: VideoVisibility; targetPlayers?: string[] }): Observable<VideoClip> {
    return this.httpClient.post<VideoClip>(`${this.matchesApiUrl}/${matchId}/videos`, dto);
  }

  updateVideo(matchId: string, videoId: string, dto: { url: string; name: string; description?: string; visibility: VideoVisibility; targetPlayers?: string[] }): Observable<VideoClip> {
    return this.httpClient.patch<VideoClip>(`${this.matchesApiUrl}/${matchId}/videos/${videoId}`, dto);
  }

  deleteVideo(matchId: string, videoId: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.matchesApiUrl}/${matchId}/videos/${videoId}`);
  }

  uploadAttachment(matchId: string, file: File, name?: string): Observable<MatchAttachment> {
    const form = new FormData();
    form.append('file', file);
    if (name) form.append('name', name);
    return this.httpClient.post<MatchAttachment>(
      `${this.matchesApiUrl}/${matchId}/attachments`,
      form
    );
  }

  deleteAttachment(matchId: string, fileId: string): Observable<void> {
    return this.httpClient.delete<void>(
      `${this.matchesApiUrl}/${matchId}/attachments/${fileId}`
    );
  }

  applySquadFromTemplate(matchId: string, squadId: string): Observable<Match> {
    return this.httpClient.post<Match>(
      `${this.matchesApiUrl}/${matchId}/squad/from/${squadId}`,
      {}
    );
  }

  recordAttendance(
    matchId: string,
    records: {
      playerId?: string;
      userId?: string;
      isStaff: boolean;
      status: AttendanceStatusEnum;
    }[]
  ): Observable<Match> {
    return this.httpClient.patch<Match>(
      `${this.matchesApiUrl}/${matchId}/attendance`,
      { records }
    );
  }
}
