import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDivisiones } from '../../queries/useDivisiones';
import { useEquipos } from '../../queries/useEquipos';
import { usePlayers } from '../../queries/usePlayers';
import { usePartidos } from '../../queries/usePartidos';
import { PartidoCard } from '../../components/domain/Partido/PartidoCard';
import { getPlayerPhotoUrl } from '../../services/Players.service';
import { type Player } from '../../domain/player';
import { POSITION_OPTIONS } from '../../domain/player-positions';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '../../components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/select';
import { Badge } from '../../components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../../components/ui/table';

function calcAge(birthDate?: string): string {
  if (!birthDate) return '—';
  const diff = Date.now() - new Date(birthDate).getTime();
  return String(Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25)));
}

export function PlantelPage() {
  const { divisionId } = useParams<{ divisionId: string }>();
  const navigate = useNavigate();
  // Radix Select no admite value="", usamos "all" como centinela de "sin filtro"
  const [filterEquipoId, setFilterEquipoId] = useState('all');
  const [filterPosition, setFilterPosition] = useState('all');

  const { data: divisiones = [] } = useDivisiones();
  const { data: equipos = [] } = useEquipos(divisionId);
  const { data: playersData, isLoading: loadingPlayers } = usePlayers({
    page: 1,
    size: 500,
  });
  const { data: partidosData, isLoading: loadingPartidos } = usePartidos({
    divisionId: divisionId || undefined,
  });

  const division = divisiones.find((d) => d.id === divisionId);

  const players: Player[] = (playersData?.items ?? []).filter((p) => {
    if (p.divisionId !== divisionId) return false;
    if (filterEquipoId !== 'all' && !p.equipoIds?.includes(filterEquipoId)) return false;
    if (filterPosition !== 'all' && p.position !== filterPosition) return false;
    return true;
  });

  const hasFilters = filterEquipoId !== 'all' || filterPosition !== 'all';

  return (
    <div className="p-6 space-y-5 max-w-6xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-ink">
          {division?.name ?? divisionId}
        </h1>
        <p className="text-sm text-muted mt-0.5">División / Plantel</p>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="plantel">
        <TabsList>
          <TabsTrigger value="plantel">Plantel</TabsTrigger>
          <TabsTrigger value="partidos">Partidos</TabsTrigger>
        </TabsList>

        {/* Tab Plantel */}
        <TabsContent value="plantel" className="space-y-4">
          {/* Filtros */}
          <div className="flex flex-wrap items-center gap-3">
            <Select value={filterEquipoId} onValueChange={setFilterEquipoId}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Todos los equipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los equipos</SelectItem>
                {equipos.map((e) => (
                  <SelectItem key={e.id} value={e.id}>
                    {e.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={filterPosition} onValueChange={setFilterPosition}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Todas las posiciones" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas las posiciones</SelectItem>
                {POSITION_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {hasFilters && (
              <button
                onClick={() => {
                  setFilterEquipoId('all');
                  setFilterPosition('all');
                }}
                className="text-sm text-interactive hover:underline"
              >
                Limpiar
              </button>
            )}

            <span className="ml-auto text-sm text-muted">
              {players.length} jugador{players.length !== 1 ? 'es' : ''}
            </span>
          </div>

          {/* Tabla */}
          <div className="rounded-xl border border-border bg-surface shadow-sm overflow-hidden">
            <Table>
              <TableHeader>
                <TableRow className="bg-border/20 hover:bg-border/20">
                  <TableHead className="w-12" />
                  <TableHead>Apellido</TableHead>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Apodo</TableHead>
                  <TableHead>Posición</TableHead>
                  <TableHead>Edad</TableHead>
                  <TableHead>Equipo(s)</TableHead>
                  <TableHead>Email</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingPlayers ? (
                  Array.from({ length: 5 }).map((_, i) => (
                    <TableRow key={i}>
                      {Array.from({ length: 8 }).map((_, j) => (
                        <TableCell key={j}>
                          <div className="h-4 bg-border/40 rounded animate-pulse" />
                        </TableCell>
                      ))}
                    </TableRow>
                  ))
                ) : players.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="py-10 text-center text-muted"
                    >
                      No hay jugadores con los filtros aplicados
                    </TableCell>
                  </TableRow>
                ) : (
                  players.map((player) => (
                    <TableRow
                      key={player._id}
                      onClick={() => navigate(`/players/${player._id}`)}
                      className="cursor-pointer"
                    >
                      <TableCell>
                        <div className="w-8 h-8 rounded-full overflow-hidden bg-border flex items-center justify-center">
                          {player.photoId ? (
                            <img
                              src={getPlayerPhotoUrl(player._id)}
                              alt={player.firstName}
                              className="w-full h-full object-cover"
                              onError={(e) => {
                                (e.target as HTMLImageElement).style.display =
                                  'none';
                              }}
                            />
                          ) : (
                            <span className="text-xs font-medium text-muted">
                              {player.firstName[0]}
                              {player.lastName[0]}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium text-ink">
                        {player.lastName}
                      </TableCell>
                      <TableCell>{player.firstName}</TableCell>
                      <TableCell className="text-muted">
                        {player.nickName ?? '—'}
                      </TableCell>
                      <TableCell>
                        <Badge variant="navy">{player.position}</Badge>
                      </TableCell>
                      <TableCell className="text-muted">
                        {calcAge(player.birthDate)}
                      </TableCell>
                      <TableCell className="text-muted">
                        {player.equipoIds?.length
                          ? player.equipoIds
                              .map(
                                (eid) =>
                                  equipos.find((e) => e.id === eid)?.name ?? eid
                              )
                              .join(', ')
                          : '—'}
                      </TableCell>
                      <TableCell className="text-muted">
                        {player.email ?? '—'}
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        {/* Tab Partidos */}
        <TabsContent value="partidos">
          {loadingPartidos ? (
            <p className="text-muted text-sm">Cargando partidos...</p>
          ) : !partidosData?.data.length ? (
            <p className="text-muted text-sm">
              No hay partidos registrados para esta división.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {partidosData.data.map((partido) => (
                <PartidoCard key={partido._id} partido={partido} />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
