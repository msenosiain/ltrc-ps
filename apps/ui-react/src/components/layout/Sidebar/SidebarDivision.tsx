import { SidebarEquipo } from "./SidebarEquipo"

interface Props {
  name: string
  equipos: { id: string; name: string }[]
  onDivisionClick: () => void
  onEquipoClick: (equipo: string) => void
}

export function SidebarDivision({
  name,
  equipos,
  onDivisionClick,
  onEquipoClick
}: Props) {
  return (
<div >
  <div onClick={onDivisionClick} className="font-semibold cursor-pointer">
    {name}
  </div>

  <div className="space-y-1 mt-1">
    {equipos.map(e => (
      <SidebarEquipo
        key={e.id}
        name={e.name}
        onClick={() => onEquipoClick(e.id)}
      />
    ))}
  </div>
</div>

  )
}
