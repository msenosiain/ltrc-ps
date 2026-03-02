import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  PaginatedResponse,
  PaginationQuery,
  Player,
  PlayerPosition,
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
    const form = this.buildFormData(dto, file);
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
    const form = this.buildFormData(dto, file);
    return this.httpClient.patch<Player>(`${this.playersApiUrl}/${id}`, form);
  }

  // UTILS - FORM DATA ──────────────────────────────────────

  private buildFormData(
    dto: ReturnType<typeof mapFormToCreatePlayerDto>,
    file?: File
  ): FormData {
    const form = new FormData();
    if (file) form.append('photo', file);

    if (dto.firstName != null) form.append('firstName', dto.firstName);
    if (dto.secondName != null) form.append('secondName', dto.secondName);
    if (dto.lastName != null) form.append('lastName', dto.lastName);
    if (dto.nickName != null) form.append('nickName', dto.nickName);
    if (dto.idNumber != null) form.append('idNumber', dto.idNumber);
    if (dto.birthDate != null) form.append('birthDate', dto.birthDate);
    if (dto.email != null) form.append('email', dto.email);
    if (dto.position != null) form.append('position', dto.position);
    if (dto.alternatePosition != null) form.append('alternatePosition', dto.alternatePosition);
    if (dto.address != null) form.append('address', JSON.stringify(dto.address));
    if (dto.clothingSizes != null) form.append('clothingSizes', JSON.stringify(dto.clothingSizes));
    if (dto.medicalData != null) form.append('medicalData', JSON.stringify(dto.medicalData));

    return form;
  }

  // IMPORT ─────────────────────────────────────────────────

  importPlayers(
    file: File
  ): Observable<{ created: number; errors: { row: number; message: string }[] }> {
    const form = new FormData();
    form.append('file', file);
    return this.httpClient.post<{
      created: number;
      errors: { row: number; message: string }[];
    }>(`${this.playersApiUrl}/import`, form);
  }

  // DELETE ─────────────────────────────────────────────────

  deletePlayer(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.playersApiUrl}/${id}`);
  }

  // UTILS ──────────────────────────────────────────────────

  getPositionLabel(position: PlayerPosition): string {
    return positionOptions.find((o) => o.id === position)?.name ?? position;
  }

  getPlayerPhotoUrl(playerId: string): string {
    return `${this.playersApiUrl}/${playerId}/photo`;
  }

  uploadPlayerPhoto(playerId: string, file: File): Observable<unknown> {
    const form = new FormData();
    form.append('photo', file);
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
