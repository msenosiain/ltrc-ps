import { Link } from "react-router-dom"

type JugadaCardProps = {
  id: string
  nombre: string
  descripcion: string
  categoria: string
  subcategoria: string
  duracion: number
  jugadores: number
  dificultad: "Baja" | "Media" | "Alta"
}

export function JugadaCard(props: JugadaCardProps) {
  const {
    id,
    nombre,
    descripcion,
    categoria,
    subcategoria,
    duracion,
    jugadores,
    dificultad,
  } = props

  return (
    <Link to={`/jugadas/${id}`} className="group">
      <div className="bg-surface text-white rounded-2xl shadow-lg overflow-hidden hover:shadow-xl transition h-full">

        <div className="h-40 bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center text-white/80">
          Video / Diagrama
        </div>

        <div className="p-5 space-y-3">
          <div className="text-xs uppercase tracking-wide text-muted">
            {categoria} · {subcategoria}
          </div>

          <h3 className="text-lg font-semibold">
            {nombre}
          </h3>

          <p className="text-sm text-muted line-clamp-2">
            {descripcion}
          </p>

          <div className="flex justify-between text-sm pt-2 border-t border-white/10">
            <span>⏱ {duracion} min</span>
            <span>👥 {jugadores}</span>
            <span>⭐ {dificultad}</span>
          </div>
        </div>
      </div>
    </Link>
  )
}
