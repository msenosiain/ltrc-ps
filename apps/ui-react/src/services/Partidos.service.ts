import { psApi } from '../lib/axios'
import type { Partido, PartidosPaginado } from '../domain/partido'

const BASE = '/partidos'

export interface PartidosFilters {
  divisionId?: string
  equipoId?: string
  fecha?: string
  page?: number
  limit?: number
}

export async function getPartidos(filters: PartidosFilters = {}): Promise<PartidosPaginado> {
  const { data } = await psApi.get<PartidosPaginado>(BASE, { params: filters })
  return data
}

export async function getPartido(id: string): Promise<Partido> {
  const { data } = await psApi.get<Partido>(`${BASE}/${id}`)
  return data
}
