import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import type { Partido } from "../../../domain/partido"

interface Props {
  partido: Partido
}

function formatFecha(fechaStr: string) {
  const d = new Date(fechaStr)
  return d.toLocaleDateString("es-AR", { day: "2-digit", month: "short", year: "numeric" })
}

export function PartidoCard({ partido }: Props) {
  return (
    <Link to={`/partidos/${partido.divisionId}/${partido._id}`}>
      <motion.div
        whileHover={{ scale: 1.03 }}
        className="bg-surface rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden h-full"
      >
        {/* Header con división */}
        <div className="h-24 bg-gradient-to-br from-navy to-blue-900 flex flex-col items-center justify-center text-white p-4">
          <span className="text-xs uppercase tracking-widest text-blue-300">
            {partido.divisionId.toUpperCase()}
          </span>
          <span className="font-bold text-lg">{partido.rival || "Sin rival"}</span>
          {partido.resultado && (
            <span className="text-sm text-blue-200">{partido.resultado}</span>
          )}
        </div>

        <div className="p-4 space-y-1">
          <p className="text-xs text-muted">{formatFecha(partido.fecha)}</p>
          <h3 className="text-base font-semibold text-ink line-clamp-2">{partido.titulo}</h3>
          {partido.descripcion && (
            <p className="text-sm text-muted line-clamp-2">{partido.descripcion}</p>
          )}
        </div>
      </motion.div>
    </Link>
  )
}
