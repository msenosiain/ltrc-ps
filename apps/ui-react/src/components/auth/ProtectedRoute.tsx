import { Navigate, Outlet } from "react-router-dom"
import { useAppSelector } from "../../store/hooks"

interface Props {
  allowedRoles?: Array<'admin' | 'entrenador' | 'jugador'>
}

export function ProtectedRoute({ allowedRoles }: Props) {
  const { isAuthenticated, user } = useAppSelector((s) => s.auth)

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && user && !allowedRoles.includes(user.rol)) {
    return <Navigate to="/" replace />
  }

  return <Outlet />
}
