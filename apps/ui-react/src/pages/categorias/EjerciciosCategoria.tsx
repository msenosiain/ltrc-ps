import { useNavigate, useParams } from "react-router-dom";
import type { EjercicioCategoriaId } from "../../domain/ejercicios";
import { SubcategoriaChips } from "../../components/domain/SubcategoriasChips";
import { EjerciciosGrid } from "../../components/domain/Ejercicio/EjerciciosGrid";
import { useEjercicioCategorias, useEjerciciosByCategoria } from "../../queries/useEjerciciosCategorias";

export function EjerciciosCategoria() {
  const { categoria } = useParams<{ categoria: EjercicioCategoriaId }>();
  const navigate = useNavigate();

  const { data: categorias, isLoading: loadingCats } = useEjercicioCategorias()
  const { data: ejercicios = [], isLoading: loadingEjs } = useEjerciciosByCategoria(categoria)

  const categoriaData = categorias?.find(c => c.id === categoria)

  if (!loadingCats && !categoriaData) {
    navigate("/", { replace: true });
    return null;
  }

  const subcategorias = (categoriaData as any)?.subcategorias ?? []

  if (loadingCats || loadingEjs) {
    return <div className="p-6 text-muted">Cargando...</div>
  }

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-navy capitalize">
        Ejercicios de {categoriaData?.name ?? categoria}
      </h1>

      <SubcategoriaChips subcategorias={subcategorias} />

      <EjerciciosGrid ejercicios={ejercicios} categoria={categoria!} />
    </div>
  );
}
