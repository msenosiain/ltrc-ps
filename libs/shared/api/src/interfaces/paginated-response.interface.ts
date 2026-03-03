export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  size: number;
}

import { SortOrder } from '../enums';

export interface PaginationQuery {
  page?: number;
  size?: number;
  filters?: Record<string, any>;
  sortBy?: string;
  sortOrder?: SortOrder;
}
