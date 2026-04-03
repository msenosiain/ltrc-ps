import { of, throwError } from 'rxjs';
import { MatchesDataSource } from './matches.datasource';
import { MatchesService } from './matches.service';
import { Match, PaginatedResponse } from '@ltrc-campo/shared-api-model';

const makeResponse = (items: Match[] = [], total = 0): PaginatedResponse<Match> => ({
  items,
  total,
  page: 1,
  size: 25,
});

describe('MatchesDataSource', () => {
  let service: jest.Mocked<Pick<MatchesService, 'getMatches'>>;
  let dataSource: MatchesDataSource;

  beforeEach(() => {
    service = {
      getMatches: jest.fn().mockReturnValue(of(makeResponse())),
    };
    dataSource = new MatchesDataSource(service as unknown as MatchesService);
  });

  it('should emit empty array initially (connect)', (done) => {
    dataSource.connect({} as any).subscribe((items) => {
      expect(items).toEqual([]);
      done();
    });
  });

  it('setFilters should call getMatches and emit results', (done) => {
    const items = [{ id: 'match-1' } as Match];
    service.getMatches.mockReturnValue(of(makeResponse(items, 1)));

    dataSource.connect({} as any).subscribe((result) => {
      if (result.length > 0) {
        expect(result).toEqual(items);
        expect(dataSource.total).toBe(1);
        done();
      }
    });

    dataSource.setFilters({ category: 'PRIMERA' as any });
  });

  it('setFilters should reset pageIndex to 0 by default', () => {
    dataSource.setFilters({});
    const call = service.getMatches.mock.calls[0][0];
    expect(call.page).toBe(1); // pageIndex 0 → page 1
  });

  it('setFilters with explicit pageIndex should pass correct page', () => {
    dataSource.setFilters({}, 2);
    const call = service.getMatches.mock.calls[0][0];
    expect(call.page).toBe(3); // pageIndex 2 → page 3
  });

  it('setPage should call load with new pagination params', () => {
    dataSource.setPage(1, 10);
    const call = service.getMatches.mock.calls[0][0];
    expect(call.page).toBe(2);
    expect(call.size).toBe(10);
  });

  it('setSorting should call load with sortBy and sortOrder', () => {
    dataSource.setSorting('date', 'desc' as any);
    const call = service.getMatches.mock.calls[0][0];
    expect(call.sortBy).toBe('date');
    expect(call.sortOrder).toBe('desc');
  });

  it('refresh() should re-trigger load', () => {
    dataSource.setFilters({});
    service.getMatches.mockClear();
    dataSource.refresh();
    expect(service.getMatches).toHaveBeenCalledTimes(1);
  });

  it('loading$ should emit true then false during load', (done) => {
    const loadingValues: boolean[] = [];
    service.getMatches.mockReturnValue(of(makeResponse()));

    dataSource.loading$.subscribe((v) => loadingValues.push(v));
    dataSource.setFilters({});

    // Allow microtasks to resolve
    setTimeout(() => {
      expect(loadingValues).toContain(true);
      expect(loadingValues[loadingValues.length - 1]).toBe(false);
      done();
    }, 50);
  });

  it('should emit empty array on error', (done) => {
    service.getMatches.mockReturnValue(throwError(() => new Error('Network error')));

    const results: Match[][] = [];
    dataSource.connect({} as any).subscribe((v) => results.push(v));

    dataSource.setFilters({});

    setTimeout(() => {
      const lastResult = results[results.length - 1];
      expect(lastResult).toEqual([]);
      done();
    }, 50);
  });

  it('configure should set size and sort state used in next load', () => {
    dataSource.configure(0, 50, 'date', 'asc' as any);
    dataSource.setFilters({});
    const call = service.getMatches.mock.calls[0][0];
    expect(call.page).toBe(1);
    expect(call.size).toBe(50);
    expect(call.sortBy).toBe('date');
    expect(call.sortOrder).toBe('asc');
  });
});
