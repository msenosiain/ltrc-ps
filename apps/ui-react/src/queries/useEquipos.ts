import { useQuery } from "@tanstack/react-query"
import { getEquipos } from "../services/Equipo.service"
import type { Equipo } from "../domain/equipo"

export function useEquipos(divisionId?: string) {
  return useQuery<Equipo[]>({
    queryKey: ["equipos", divisionId],
    queryFn: () => getEquipos(divisionId),
    staleTime: Infinity,
  })
}
