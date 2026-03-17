import { ListStateService, ListState } from './list-state.service';
import { SortOrder } from '@ltrc-ps/shared-api-model';

describe('ListStateService', () => {
  let service: ListStateService;

  beforeEach(() => {
    service = new ListStateService();
  });

  it('should return undefined for unknown key', () => {
    expect(service.get('unknown')).toBeUndefined();
  });

  it('should save and retrieve state', () => {
    const state: ListState = {
      filters: { searchTerm: 'test' },
      pageIndex: 2,
      pageSize: 20,
      sortBy: 'name',
      sortOrder: SortOrder.ASC,
    };

    service.save('players', state);

    expect(service.get('players')).toEqual(state);
  });

  it('should overwrite state on subsequent save', () => {
    service.save('players', {
      filters: { searchTerm: 'old' },
      pageIndex: 0,
      pageSize: 10,
    });

    const updated: ListState = {
      filters: { searchTerm: 'new' },
      pageIndex: 1,
      pageSize: 10,
    };
    service.save('players', updated);

    expect(service.get('players')).toEqual(updated);
  });

  it('should store independent state per key', () => {
    const playersState: ListState = {
      filters: { searchTerm: 'player' },
      pageIndex: 0,
      pageSize: 10,
    };
    const matchesState: ListState = {
      filters: { status: 'completed' },
      pageIndex: 3,
      pageSize: 20,
    };

    service.save('players', playersState);
    service.save('matches', matchesState);

    expect(service.get('players')).toEqual(playersState);
    expect(service.get('matches')).toEqual(matchesState);
  });

  it('should clear state for a key', () => {
    service.save('players', {
      filters: {},
      pageIndex: 0,
      pageSize: 10,
    });

    service.clear('players');

    expect(service.get('players')).toBeUndefined();
  });

  it('should not affect other keys when clearing', () => {
    service.save('players', { filters: {}, pageIndex: 0, pageSize: 10 });
    service.save('matches', { filters: {}, pageIndex: 1, pageSize: 20 });

    service.clear('players');

    expect(service.get('players')).toBeUndefined();
    expect(service.get('matches')).toBeDefined();
  });
});
