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
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root',
})
export class PlayersService {
  private httpClient = inject(HttpClient);
  private config = inject(API_CONFIG_TOKEN);
  private readonly playersApiUrl = `${this.config.baseUrl}/players`;

  getPlayers(query: PaginationQuery): Observable<PaginatedResponse<Player>> {
    let params = new HttpParams();

    if (query.page) params = params.set('page', query.page);
    if (query.size) params = params.set('size', query.size);

    if (query.filters && Object.keys(query.filters).length > 0) {
      params = params.set('filters', JSON.stringify(query.filters));
    }

    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.sortOrder) params = params.set('sortOrder', query.sortOrder);

    return this.httpClient.get<PaginatedResponse<Player>>(this.playersApiUrl, {
      params,
    });
  }

  getPlayerById(id: string): Observable<Player> {
    return this.httpClient.get<Player>(`${this.playersApiUrl}/${id}`);
  }

  createPlayer(player: Partial<Player>): Observable<Player> {
    return this.httpClient.post<Player>(this.playersApiUrl, player);
  }

  updatePlayer(id: string, player: Partial<Player>): Observable<Player> {
    return this.httpClient.patch<Player>(`${this.playersApiUrl}/${id}`, player);
  }

  deletePlayer(id: string): Observable<void> {
    return this.httpClient.delete<void>(`${this.playersApiUrl}/${id}`);
  }

  getPositionLabel(position: PlayerPositionEnum): string {
    const option = positionOptions.find((o) => o.id === position);
    return option ? option.name : position;
  }

  getPlayerPhotoUrl(playerId: string): string {
    return `${environment.apiBaseUrl}/players/${playerId}/photo`;
  }

  calculatePlayerAge(birthDate: Date | string): number {
    const birth = new Date(birthDate);
    const today = new Date();

    let age = today.getFullYear() - birth.getFullYear();
    const monthDifference = today.getMonth() - birth.getMonth();
    const dayDifference = today.getDate() - birth.getDate();

    // If the current month is before the birth month,
    // or it is the same month but the current day is before the birth day,
    // subtract one year.
    if (monthDifference < 0 || (monthDifference === 0 && dayDifference < 0)) {
      age--;
    }

    return age;
  }
}
