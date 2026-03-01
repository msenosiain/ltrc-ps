import { Navigate, Route, Routes } from 'react-router-dom';
import { Home } from '../pages/Home';
import { AppLayout } from '../components/layout/AppLayout';
import { EjerciciosCategoria } from '../pages/categorias/EjerciciosCategoria';
import { EjercicioDetalle } from '../pages/categorias/EjercicioDetalle';
import { LoginPage } from '../pages/Login';
import { ProtectedRoute } from '../components/auth/ProtectedRoute';
import { PartidosList } from '../pages/partidos/PartidosList';
import { PartidoDetalle } from '../pages/partidos/PartidoDetalle';
import { PlayersPage } from '../pages/players/PlayersPage';
import { PlayerDetailPage } from '../pages/players/PlayerDetailPage';
import { PlayerEditPage } from '../pages/players/PlayerEditPage';
import { PlantelPage } from '../pages/plantel/PlantelPage';

export function AppRoutes() {
  return (
    <Routes>
      {/* Redirige raíz a /players */}
      <Route path="/" element={<Navigate to="/players" replace />} />

      {/* Pública */}
      <Route path="/login" element={<LoginPage />} />

      {/* Rutas protegidas con Layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="home" element={<Home />} />

          {/* Plantel */}
          <Route path="players" element={<PlayersPage />} />
          <Route path="players/:id" element={<PlayerDetailPage />} />
          <Route path="players/:id/edit" element={<PlayerEditPage />} />

          {/* Ejercicios */}
          <Route
            path="ejercicios/:categoria"
            element={<EjerciciosCategoria />}
          />
          <Route
            path="ejercicios/:categoria/:id"
            element={<EjercicioDetalle />}
          />

          {/* División / Plantel */}
          <Route path="plantel/:divisionId" element={<PlantelPage />} />

          {/* Partidos */}
          <Route path="partidos" element={<PartidosList />} />
          <Route path="partidos/:divisionId" element={<PartidosList />} />
          <Route path="partidos/:divisionId/:id" element={<PartidoDetalle />} />
        </Route>
      </Route>

      {/* Admin (solo admin/entrenador) */}
      <Route
        element={
          <ProtectedRoute allowedRoles={['admin', 'entrenador']} />
        }
      >
        <Route element={<AppLayout />}>
          {/* AdminEjercicios, AdminPartidos se agregan en fases futuras */}
        </Route>
      </Route>
    </Routes>
  );
}
