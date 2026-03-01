import { Link, useNavigate, useParams } from "react-router-dom"
import { usePartido } from "../../queries/usePartidos"
import { Button } from "../../components/ui/Button"

function resolveVideoSrc(url: string): string {
  // Google Drive: /view → /preview
  if (url.includes("drive.google.com")) {
    return url.replace("/view", "/preview")
  }
  // YouTube: watch → embed
  const ytMatch = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([a-zA-Z0-9_-]+)/)
  if (ytMatch) {
    return `https://www.youtube.com/embed/${ytMatch[1]}`
  }
  return url
}

function formatFecha(fechaStr: string) {
  const d = new Date(fechaStr)
  return d.toLocaleDateString("es-AR", { weekday: "long", day: "2-digit", month: "long", year: "numeric" })
}

export function PartidoDetalle() {
  const { id } = useParams<{ id: string }>()
  const { data: partido, isLoading } = usePartido(id)
  const navigate = useNavigate()

  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Cargando partido...
      </main>
    )
  }

  if (!partido) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <p className="text-muted">Partido no encontrado</p>
        <Link to="/partidos" className="text-interactive underline">
          Volver a partidos
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-6">

        <Button onClick={() => navigate(-1)} className="text-sm text-interactive hover:underline">
          ← Volver
        </Button>

        <div className="bg-surface rounded-2xl p-6 shadow-lg space-y-4">

          <div className="space-y-1">
            <span className="text-xs uppercase tracking-widest text-muted">
              {partido.divisionId.toUpperCase()}
            </span>
            <h1 className="text-h2 text-ink">{partido.titulo}</h1>
            <p className="text-sm text-muted">{formatFecha(partido.fecha)}</p>
          </div>

          {/* Info del partido */}
          <div className="flex flex-wrap gap-4 text-sm">
            {partido.rival && (
              <span className="bg-navy/10 text-navy rounded-full px-3 py-1">
                vs. {partido.rival}
              </span>
            )}
            {partido.resultado && (
              <span className="bg-interactive/10 text-interactive rounded-full px-3 py-1 font-bold">
                {partido.resultado}
              </span>
            )}
          </div>

          {/* Video */}
          {partido.videoUrl && (
            <div className="aspect-video rounded-lg overflow-hidden">
              <iframe
                src={resolveVideoSrc(partido.videoUrl)}
                className="w-full h-full"
                allow="autoplay"
                allowFullScreen
              />
            </div>
          )}

          {partido.descripcion && (
            <p className="text-body text-muted">{partido.descripcion}</p>
          )}

          {partido.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {partido.tags.map((tag) => (
                <span key={tag} className="text-xs bg-border text-muted rounded-full px-2 py-1">
                  #{tag}
                </span>
              ))}
            </div>
          )}

        </div>
      </div>
    </main>
  )
}
