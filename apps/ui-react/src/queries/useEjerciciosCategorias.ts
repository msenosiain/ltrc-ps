import { useQuery } from "@tanstack/react-query"
import type { EjercicioCategoria } from "../domain/ejercicios"
import { getEjercicio, getEjercicioCategorias } from "../services/Ejercicios.service"
import { contentApi } from "../lib/axios"
import type { Ejercicio } from "../utils/types"

export function useEjercicioCategorias() {
  return useQuery<EjercicioCategoria[]>({
    queryKey: ["ejercicioCategorias"],
    queryFn: getEjercicioCategorias,
    staleTime: Infinity
  })
}

export function useEjercicioQuery(id?: string) {
  return useQuery<Ejercicio | null>({
    queryKey: ["ejercicio", id],
    queryFn: () => getEjercicio(id!),
    enabled: !!id,
    staleTime: Infinity
  })
}

export function useEjerciciosByCategoria(categoriaId?: string) {
  return useQuery<Ejercicio[]>({
    queryKey: ["ejercicios", categoriaId],
    queryFn: async () => {
      const { data } = await contentApi.get<{ data: any[] }>('/ejercicios', {
        params: { categoriaId, limit: 100 }
      })
      // Adaptar campos del backend al tipo frontend
      return data.data.map((ej: any) => ({
        id: ej._id,
        titulo: ej.titulo,
        descripcion: ej.descripcion,
        subcategoria: ej.subcategoriaId,
        video: ej.videoUrl,
      }))
    },
    enabled: !!categoriaId,
    staleTime: 1000 * 60 * 5,
  })
}
