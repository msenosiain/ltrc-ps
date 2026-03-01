import { psApi } from '../lib/axios';
import type {
  PaginatedPlayers,
  Player,
  PlayersQueryParams,
  UpdatePlayerData,
} from '../domain/player';

export async function fetchPlayers(
  params: PlayersQueryParams
): Promise<PaginatedPlayers> {
  const { page, size, sortBy, sortOrder, filters } = params;

  const queryParams: Record<string, string | number> = { page, size };
  if (sortBy) queryParams.sortBy = sortBy;
  if (sortOrder) queryParams.sortOrder = sortOrder;
  if (filters?.searchTerm) queryParams['filters[searchTerm]'] = filters.searchTerm;
  if (filters?.position) queryParams['filters[position]'] = filters.position;

  const { data } = await psApi.get<PaginatedPlayers>('/players', {
    params: queryParams,
  });
  return data;
}

export async function fetchPlayer(id: string): Promise<Player> {
  const { data } = await psApi.get<Player>(`/players/${id}`);
  return data;
}

export function buildPlayerFormData(
  playerData: Partial<UpdatePlayerData>,
  photo?: File
): FormData {
  const fd = new FormData();

  // Campos escalares
  const scalarFields = [
    'idNumber', 'firstName', 'lastName', 'nickName',
    'birthDate', 'email', 'position', 'alternatePosition',
    'height', 'weight', 'divisionId',
  ] as const;

  for (const field of scalarFields) {
    let value = (playerData as Record<string, unknown>)[field];
    if (value !== undefined && value !== null && value !== '') {
      if (field === 'birthDate' && typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
        const [y, m, d] = value.split('-');
        value = `${d}/${m}/${y}`;
      }
      fd.append(field, String(value));
    }
  }

  // Objeto address
  if (playerData.address) {
    const addr = playerData.address;
    const addrFields = ['street', 'number', 'floor', 'apartment', 'city', 'province', 'postalCode', 'country', 'phoneNumber'] as const;
    for (const f of addrFields) {
      if (addr[f] !== undefined && addr[f] !== '') {
        fd.append(`address[${f}]`, String(addr[f]));
      }
    }
  }

  // Objeto clothingSizes
  if (playerData.clothingSizes) {
    const sizes = playerData.clothingSizes;
    const sizeFields = ['jersey', 'shorts', 'sweater', 'pants'] as const;
    for (const f of sizeFields) {
      if (sizes[f] !== undefined && (sizes[f] as string) !== '') {
        fd.append(`clothingSizes[${f}]`, String(sizes[f]));
      }
    }
  }

  // Array equipoIds
  if (Array.isArray(playerData.equipoIds)) {
    playerData.equipoIds.forEach((id, i) => fd.append(`equipoIds[${i}]`, id));
  }

  // Foto
  if (photo) {
    fd.append('photo', photo);
  }

  return fd;
}

export async function createPlayer(
  playerData: Partial<UpdatePlayerData>,
  photo?: File
): Promise<Player> {
  const fd = buildPlayerFormData(playerData, photo);
  const { data } = await psApi.post<Player>('/players', fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function updatePlayer(
  id: string,
  playerData: Partial<UpdatePlayerData>,
  photo?: File
): Promise<Player> {
  const fd = buildPlayerFormData(playerData, photo);
  const { data } = await psApi.patch<Player>(`/players/${id}`, fd, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
}

export async function deletePlayer(id: string): Promise<void> {
  await psApi.delete(`/players/${id}`);
}

export function getPhotoUrl(photoId: string | undefined): string | undefined {
  if (!photoId) return undefined;
  // El photoId en la respuesta ya es el id del archivo en GridFS
  // La ruta del API sirve la foto usando el _id del jugador, no el photoId directamente
  return undefined; // Se obtiene usando /players/:id/photo en el componente
}

export function getPlayerPhotoUrl(playerId: string): string {
  return `${import.meta.env.VITE_PS_API_URL || 'http://localhost:3000/api'}/players/${playerId}/photo`;
}
