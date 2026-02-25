import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PaginatedResponse,
  PaginationQuery,
  Player,
  PlayerPositionEnum,
} from '@ltrc-ps/shared-api-model';
import { API_CONFIG_TOKEN } from '../../app.config';
import { positionOptions } from '../position-options';
import { PlayerFormValue } from '../forms/player-form.types';
import { mapFormToCreatePlayerDto } from '../forms/player-form.mapper';

@Injectable({
  providedIn: 'root',
})
export class PlayersService {
  private readonly httpClient = inject(HttpClient);
  private readonly config = inject(API_CONFIG_TOKEN);
  private readonly playersApiUrl = `${this.config.baseUrl}/players`;

  getPlayers(query: PaginationQuery): Observable<PaginatedResponse<Player>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.size) params = params.set('size', query.size);
    if (query.filters && Object.keys(query.filters).length > 0)
      params = params.set('filters', JSON.stringify(query.filters));
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.sortOrder) params = params.set('sortOrder', query.sortOrder);

    return this.httpClient.get<PaginatedResponse<Player>>(this.playersApiUrl, {
      params,
    });
  }

  getPlayerById(id: string): Observable<Player> {
    return this.httpClient.get<Player>(`${this.playersApiUrl}/${id}`);
  }

  // CREATE ─────────────────────────────────────────────────

  createPlayer(formValue: PlayerFormValue): Observable<Player> {
    const dto = mapFormToCreatePlayerDto(formValue);
    return this.httpClient.post<Player>(this.playersApiUrl, dto);
  }

  createPlayerWithPhoto(
    formValue: PlayerFormValue,
    file: File
  ): Observable<Player> {
    const dto = mapFormToCreatePlayerDto(formValue);
    const form = new FormData();
    form.append('file', file);
    form.append('dto', JSON.stringify(dto));
    return this.httpClient.post<Player>(this.playersApiUrl, form);
  }

  // UPDATE ─────────────────────────────────────────────────

  updatePlayer(id: string, formValue: PlayerFormValue): Observable<Player> {
    const dto = mapFormToCreatePlayerDto(formValue);
    return this.httpClient.patch<Player>(`${this.playersApiUrl}/${id}`, dto);
  }

  updatePlayerWithPhoto(
    id: string,
    formValue: PlayerFormValue,
    file: File
  ): Observable<Player> {
    const dto = mapFormToCreatePlayerDto(formValue);
    const form = new FormData();
    form.append('file', file);
    form.append('dto', JSON.stringify(dto));
    return this.httpClient.patch<Player>(`${this.playersApiUrl}/${id}`, form);
  }

  // DELETE ─────────────────────────────────────────────────

  deletePlayer(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.playersApiUrl}/${id}`);
  }

  // UTILS ──────────────────────────────────────────────────

  getPositionLabel(position: PlayerPositionEnum): string {
    return positionOptions.find((o) => o.id === position)?.name ?? position;
  }

  getPlayerPhotoUrl(playerId: string): string {
    return `${this.playersApiUrl}/${playerId}/photo`;
  }

  uploadPlayerPhoto(playerId: string, file: File): Observable<unknown> {
    const form = new FormData();
    form.append('file', file);
    return this.httpClient.post(
      `${this.playersApiUrl}/${playerId}/photo`,
      form
    );
  }

  calculatePlayerAge(birthDate: Date | string): number {
    const birth = new Date(birthDate);
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if (m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }
}
