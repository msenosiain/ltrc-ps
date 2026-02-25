import type { DivisionId } from "./division"


export interface Equipo {
  id: string
  name: string
  divisionId: DivisionId
  order: number
}
