import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Squad } from '@ltrc-ps/shared-api-model';
import { API_CONFIG_TOKEN } from '../../app.config';

@Injectable({ providedIn: 'root' })
export class SquadsService {
  private readonly httpClient = inject(HttpClient);
  private readonly config = inject(API_CONFIG_TOKEN);
  private readonly squadsApiUrl = `${this.config.baseUrl}/squads`;

  getSquads(): Observable<Squad[]> {
    return this.httpClient.get<Squad[]>(this.squadsApiUrl);
  }
}
