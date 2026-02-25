import { useQuery } from "@tanstack/react-query"
import { getPartido, getPartidos } from "../services/Partidos.service"
import type { PartidosFilters } from "../services/Partidos.service"

export function usePartidos(filters: PartidosFilters = {}) {
  return useQuery({
    queryKey: ["partidos", filters],
    queryFn: () => getPartidos(filters),
    staleTime: 1000 * 60 * 5,
  })
}

export function usePartido(id?: string) {
  return useQuery({
    queryKey: ["partido", id],
    queryFn: () => getPartido(id!),
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  })
}
