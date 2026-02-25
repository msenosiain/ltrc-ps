import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import type { Ejercicio } from "../../../utils/types";

interface Props {
  ejercicio: Ejercicio;
  categoria: string;
}

export function EjercicioCard({ ejercicio, categoria }: Props) {
  return (
    <Link to={`/ejercicios/${categoria}/${ejercicio.id}`}>
      <motion.div
        whileHover={{ scale: 1.03 }}
        className="bg-surface text-white rounded-2xl shadow-md hover:shadow-xl transition overflow-hidden h-full"
      >
        <div className="h-32 bg-gradient-to-br from-primary to-blue-700 flex items-center justify-center text-white/80">
          Diagrama / Video
        </div>

        <div className="p-4 space-y-2">
          <div className="text-xs uppercase tracking-wide text-muted">
            {categoria} · {ejercicio.subcategoria}
          </div>

          <h3 className="text-lg text-navy font-semibold">
            {ejercicio.titulo}
          </h3>

          <p className="text-sm text-muted line-clamp-2">
            {ejercicio.descripcion}
          </p>
        </div>
      </motion.div>
    </Link>
  );
}
