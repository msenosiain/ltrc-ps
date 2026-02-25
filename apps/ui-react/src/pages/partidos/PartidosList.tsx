import { useState } from "react"
import { useParams } from "react-router-dom"
import { usePartidos } from "../../queries/usePartidos"
import { useDivisiones } from "../../queries/useDivisiones"
import { PartidoCard } from "../../components/domain/Partido/PartidoCard"

export function PartidosList() {
  const { divisionId: paramDivision } = useParams<{ divisionId?: string }>()
  const { data: divisiones } = useDivisiones()

  const [selectedDivision, setSelectedDivision] = useState(paramDivision || "")
  const [fecha, setFecha] = useState("")

  const { data, isLoading } = usePartidos({
    divisionId: selectedDivision || undefined,
    fecha: fecha || undefined,
  })

  return (
    <main className="min-h-screen bg-background p-6 space-y-6">
      <h1 className="text-h2 text-ink">Partidos</h1>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <select
          value={selectedDivision}
          onChange={(e) => setSelectedDivision(e.target.value)}
          className="border border-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">Todas las divisiones</option>
          {divisiones?.map((div) => (
            <option key={div.id} value={div.id}>
              {div.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={fecha}
          onChange={(e) => setFecha(e.target.value)}
          className="border border-border rounded-lg px-3 py-2 text-sm text-ink focus:outline-none focus:ring-2 focus:ring-primary"
        />

        {(selectedDivision || fecha) && (
          <button
            onClick={() => { setSelectedDivision(""); setFecha("") }}
            className="text-sm text-primary hover:underline"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Contenido */}
      {isLoading ? (
        <p className="text-muted">Cargando partidos...</p>
      ) : !data?.data.length ? (
        <p className="text-muted">No hay partidos para los filtros seleccionados.</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {data.data.map((partido) => (
            <PartidoCard key={partido._id} partido={partido} />
          ))}
        </div>
      )}
    </main>
  )
}
