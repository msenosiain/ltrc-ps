export type EjercicioCategoriaId =
  | "ruck"
  | "ataque"
  | "defensa"
  | "fisico"
  | "lineout"
  | "scrum"
  | "kicking"

export interface EjercicioCategoria {
  id: EjercicioCategoriaId
  name: string
  order: number
}
