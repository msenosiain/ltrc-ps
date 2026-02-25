import { Link, useNavigate, useParams } from "react-router-dom"
import { useEjercicioQuery } from "../../queries/useEjerciciosCategorias"
import { Button } from "../../components/ui/Button";

export function EjercicioDetalle() {
  const { id } = useParams<{ id: string }>()
  const { data: ejercicio, isLoading } = useEjercicioQuery(id)
  const navigate = useNavigate();

  const handleGoBack = () => {
    navigate(-1);
  };
  if (isLoading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        Cargando ejercicio...
      </main>
    )
  }

  if (!ejercicio) {
    return (
      <main className="min-h-screen flex flex-col items-center justify-center space-y-4">
        <p className="text-muted">Ejercicio no encontrado</p>
        <Link to="/" className="text-primary underline">
          Volver al inicio
        </Link>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-background px-6 py-10">
      <div className="max-w-4xl mx-auto space-y-6">

        <Button
          onClick={handleGoBack}
          className="text-sm text-primary hover:underline"
        >
          ← Volver
        </Button>

        <div className="bg-surface rounded-2xl p-6 shadow-lg space-y-4">

          <div className="space-y-1">
            <h1 className="text-h2 text-ink">
              {ejercicio.titulo}
            </h1>

            <p className="text-sm text-muted capitalize">
              Subcategoría · {ejercicio.subcategoria}
            </p>
          </div>

          {/* Video */}
          {ejercicio.video && (
            <div className="aspect-video rounded-lg overflow-hidden">
              <iframe
                src={ejercicio.video.replace("/view", "/preview")}
                className="w-full h-full"
                allow="autoplay"
                allowFullScreen
              />
            </div>
          )}

          <p className="text-body text-muted">
            {ejercicio.descripcion}
          </p>

        </div>
      </div>
    </main>
  )
}
