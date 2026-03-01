import { psApi } from '../lib/axios'
import type { Division } from '../domain/division'

const API_URL = '/divisiones'

export async function getDivisiones(): Promise<Division[]> {
  const { data } = await psApi.get<Division[]>(API_URL)
  return data
}
