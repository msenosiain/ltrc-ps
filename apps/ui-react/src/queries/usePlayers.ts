import { useQuery } from '@tanstack/react-query';
import { fetchPlayers } from '../services/Players.service';
import type { PlayersQueryParams } from '../domain/player';

export const PLAYERS_QUERY_KEY = 'players';

export function usePlayers(params: PlayersQueryParams) {
  return useQuery({
    queryKey: [PLAYERS_QUERY_KEY, params],
    queryFn: () => fetchPlayers(params),
    placeholderData: (prev) => prev,
  });
}
