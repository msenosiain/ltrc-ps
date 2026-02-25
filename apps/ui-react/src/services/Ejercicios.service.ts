import { contentApi } from '../lib/axios'
import type { EjercicioCategoria } from '../domain/ejercicios'
import type { Ejercicio } from '../utils/types'

const CAT_URL = '/ejercicios/categorias'
const BASE_URL = '/ejercicios'

export async function getEjercicioCategorias(): Promise<EjercicioCategoria[]> {
  const { data } = await contentApi.get<EjercicioCategoria[]>(CAT_URL)
  return data
}

export async function getEjercicio(id: string): Promise<Ejercicio | null> {
  try {
    const { data } = await contentApi.get<any>(`${BASE_URL}/${id}`)
    // Adaptar shape del backend → tipo frontend
    return {
      id: data._id,
      titulo: data.titulo,
      descripcion: data.descripcion,
      subcategoria: data.subcategoriaId,
      video: data.videoUrl,
    }
  } catch {
    return null
  }
}
