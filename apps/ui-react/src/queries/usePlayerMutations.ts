import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useNavigate } from 'react-router-dom';
import {
  createPlayer,
  deletePlayer,
  updatePlayer,
} from '../services/Players.service';
import type { UpdatePlayerData } from '../domain/player';
import { PLAYERS_QUERY_KEY } from './usePlayers';

export function useCreatePlayer() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({
      data,
      photo,
    }: {
      data: Partial<UpdatePlayerData>;
      photo?: File;
    }) => createPlayer(data, photo),
    onSuccess: (player) => {
      queryClient.invalidateQueries({ queryKey: [PLAYERS_QUERY_KEY] });
      toast.success('Jugador creado correctamente');
      navigate(`/players/${player._id}`);
    },
    onError: () => {
      toast.error('Error al crear el jugador');
    },
  });
}

export function useUpdatePlayer(id: string) {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: ({
      data,
      photo,
    }: {
      data: Partial<UpdatePlayerData>;
      photo?: File;
    }) => updatePlayer(id, data, photo),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PLAYERS_QUERY_KEY] });
      toast.success('Jugador actualizado correctamente');
      navigate(`/players/${id}`);
    },
    onError: () => {
      toast.error('Error al actualizar el jugador');
    },
  });
}

export function useDeletePlayer() {
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (id: string) => deletePlayer(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [PLAYERS_QUERY_KEY] });
      toast.success('Jugador eliminado');
      navigate('/players');
    },
    onError: () => {
      toast.error('Error al eliminar el jugador');
    },
  });
}
