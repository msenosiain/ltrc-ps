import { useQuery } from '@tanstack/react-query';
import { fetchPlayer } from '../services/Players.service';
import { PLAYERS_QUERY_KEY } from './usePlayers';

export function usePlayer(id: string | undefined) {
  return useQuery({
    queryKey: [PLAYERS_QUERY_KEY, id],
    queryFn: () => fetchPlayer(id!),
    enabled: !!id,
  });
}
