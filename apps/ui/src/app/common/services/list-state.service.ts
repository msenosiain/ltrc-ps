import { Injectable } from '@angular/core';
import { SortOrder } from '@ltrc-ps/shared-api-model';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export interface ListState {
  filters: any;
  pageIndex: number;
  pageSize: number;
  sortBy?: string;
  sortOrder?: SortOrder;
}

@Injectable({ providedIn: 'root' })
export class ListStateService {
  private readonly states = new Map<string, ListState>();

  save(key: string, state: ListState): void {
    this.states.set(key, state);
  }

  get(key: string): ListState | undefined {
    return this.states.get(key);
  }

  clear(key: string): void {
    this.states.delete(key);
  }
}
