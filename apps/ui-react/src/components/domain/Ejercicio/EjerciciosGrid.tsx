
import type { Ejercicio } from "../../../utils/types";
import { EjercicioCard } from "./EjercicioCard";

interface Props {
  ejercicios: Ejercicio[];
  categoria: string;
}

export function EjerciciosGrid({ ejercicios, categoria }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {ejercicios.map(ej => (
        <EjercicioCard
          key={ej.id}
          ejercicio={ej}
          categoria={categoria}
        />
      ))}
    </div>
  );
}
