import { contentApi } from '../lib/axios'
import type { Equipo } from '../domain/equipo'

const API_URL = '/equipos'

export async function getEquipos(divisionId?: string): Promise<Equipo[]> {
  const params = divisionId ? { divisionId } : {}
  const { data } = await contentApi.get<Equipo[]>(API_URL, { params })
  return data
}
