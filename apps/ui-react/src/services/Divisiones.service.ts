import { contentApi } from '../lib/axios'
import type { Division } from '../domain/division'

const API_URL = '/divisiones'

export async function getDivisiones(): Promise<Division[]> {
  const { data } = await contentApi.get<Division[]>(API_URL)
  return data
}
