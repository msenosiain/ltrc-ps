export interface Partido {
  _id: string
  titulo: string
  descripcion: string
  divisionId: string
  equipoId: string
  fecha: string
  rival: string
  resultado: string
  videoUrl: string
  tags: string[]
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface PartidosPaginado {
  data: Partido[]
  total: number
  page: number
  limit: number
  totalPages: number
}
