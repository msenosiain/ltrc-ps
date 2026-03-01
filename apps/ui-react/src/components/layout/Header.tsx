import { useAppDispatch, useAppSelector } from "../../store/hooks"
import { logout } from "../../store/authSlice"
import { useNavigate } from "react-router-dom"

export function Header() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const user = useAppSelector((s) => s.auth.user)

  const handleLogout = () => {
    dispatch(logout())
    navigate("/login", { replace: true })
  }

  return (
    <header className="h-24 py-6 border-b border-primary border-bottom-4 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <img src="/assets/logo-ltrc.png" width="52px" height="52px" style={{ margin: "0px 10px 0px 0px" }} />
        <h1 className="text-navy">
          Los Tordos Rugby Club 🏉
        </h1>
      </div>

      {user && (
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted hidden sm:block">
            {user.firstName} {user.lastName}
            <span className="ml-1 text-xs text-interactive capitalize">({user.rol})</span>
          </span>
          <button
            onClick={handleLogout}
            className="text-sm text-interactive hover:underline"
          >
            Salir
          </button>
        </div>
      )}
    </header>
  )
}
