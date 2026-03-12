import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {
  BranchAssignment,
  BranchAssignmentFilters,
  CategoryEnum,
  HockeyBranchEnum,
  SportEnum,
} from '@ltrc-ps/shared-api-model';
import { API_CONFIG_TOKEN } from '../../app.config';

@Injectable({ providedIn: 'root' })
export class BranchAssignmentsService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(API_CONFIG_TOKEN);
  private readonly apiUrl = `${this.config.baseUrl}/branch-assignments`;

  findAll(filters: BranchAssignmentFilters): Observable<BranchAssignment[]> {
    let params = new HttpParams();
    if (filters.season) params = params.set('season', filters.season);
    if (filters.category) params = params.set('category', filters.category);
    if (filters.branch) params = params.set('branch', filters.branch);
    if (filters.player) params = params.set('player', filters.player);
    return this.http.get<BranchAssignment[]>(this.apiUrl, { params });
  }

  create(
    playerId: string,
    branch: HockeyBranchEnum,
    category: CategoryEnum,
    season: number
  ): Observable<BranchAssignment> {
    return this.http.post<BranchAssignment>(this.apiUrl, {
      player: playerId,
      branch,
      category,
      season,
      sport: SportEnum.HOCKEY,
    });
  }

  updateBranch(
    id: string,
    branch: HockeyBranchEnum
  ): Observable<BranchAssignment> {
    return this.http.patch<BranchAssignment>(`${this.apiUrl}/${id}`, {
      branch,
    });
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  importFromFile(
    file: File,
    season: number
  ): Observable<{
    created: number;
    updated: number;
    errors: { row: number; message: string }[];
  }> {
    const form = new FormData();
    form.append('file', file);
    form.append('season', String(season));
    return this.http.post<{
      created: number;
      updated: number;
      errors: { row: number; message: string }[];
    }>(`${this.apiUrl}/import`, form);
  }
}
