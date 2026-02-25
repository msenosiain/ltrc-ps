export type DivisionId =
  | "ps"
  | "m19"
  | "m18"
  | "m17"
  | "m16"
  | "m15"
  | "m14"

export interface Division {
  id: DivisionId
  name: string
  order: number
}
    