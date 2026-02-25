import { useQuery } from "@tanstack/react-query"
import { getDivisiones } from "../services/Divisiones.service"
import type { Division } from "../domain/division"

export function useDivisiones() {
  return useQuery<Division[]>({
    queryKey: ["divisiones"],
    queryFn: getDivisiones,
    staleTime: Infinity,
  })
}
