import { useNavigate, useSearchParams } from "react-router-dom"
import { useDispatch } from "react-redux"
import { setDivision, setEquipo } from "../store/filterSlice"

export function useSidebarNavigation() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const dispatch = useDispatch()

  function selectDivision(division: string) {
    dispatch(setDivision(division))
    navigate(`/jugadas?division=${division}`)
  }

  function selectEquipo(division: string, equipo: string) {
    dispatch(setEquipo(equipo))
    navigate(`/jugadas?division=${division}&equipo=${equipo}`)
  }

  return { selectDivision, selectEquipo }
}
