import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Squad } from '@ltrc-ps/shared-api-model';
import { API_CONFIG_TOKEN } from '../../app.config';

export interface SquadPayloadEntry {
  shirtNumber: number;
  playerId: string;
}

export interface SquadPayload {
  name: string;
  players: SquadPayloadEntry[];
}

@Injectable({ providedIn: 'root' })
export class SquadsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG_TOKEN);
  private readonly baseUrl = `${this.config.baseUrl}/squads`;

  getSquads(): Observable<Squad[]> {
    return this.http.get<Squad[]>(this.baseUrl);
  }

  getSquad(id: string): Observable<Squad> {
    return this.http.get<Squad>(`${this.baseUrl}/${id}`);
  }

  createSquad(payload: SquadPayload): Observable<Squad> {
    return this.http.post<Squad>(this.baseUrl, payload);
  }

  updateSquad(id: string, payload: Partial<SquadPayload>): Observable<Squad> {
    return this.http.patch<Squad>(`${this.baseUrl}/${id}`, payload);
  }

  deleteSquad(id: string): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }
}