import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, ChevronUp, ChevronDown, ChevronsUpDown, Loader2 } from 'lucide-react';
import { usePlayers } from '../../queries/usePlayers';
import { PlayerFilters } from './PlayerFilters';
import { PlayerDialog } from './PlayerDialog';
import type { Player, PlayerFilters as Filters } from '../../domain/player';
import { getPlayerPhotoUrl } from '../../services/Players.service';

interface SortState {
  sortBy: string;
  sortOrder: 'asc' | 'desc';
}

const PAGE_SIZES = [10, 25, 50];

export function PlayersPage() {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [size, setSize] = useState(10);
  const [sort, setSort] = useState<SortState>({ sortBy: 'lastName', sortOrder: 'asc' });
  const [filters, setFilters] = useState<Filters>({});
  const [dialogOpen, setDialogOpen] = useState(false);

  const { data, isLoading, isFetching } = usePlayers({
    page,
    size,
    sortBy: sort.sortBy,
    sortOrder: sort.sortOrder,
    filters,
  });

  const totalPages = data ? Math.ceil(data.total / size) : 0;

  const handleSort = (column: string) => {
    setSort((prev) =>
      prev.sortBy === column
        ? { ...prev, sortOrder: prev.sortOrder === 'asc' ? 'desc' : 'asc' }
        : { sortBy: column, sortOrder: 'asc' }
    );
    setPage(1);
  };

  const handleFiltersChange = (newFilters: Filters) => {
    setFilters(newFilters);
    setPage(1);
  };

  const SortIcon = ({ column }: { column: string }) => {
    if (sort.sortBy !== column)
      return <ChevronsUpDown size={14} className="text-muted" />;
    return sort.sortOrder === 'asc' ? (
      <ChevronUp size={14} className="text-primary" />
    ) : (
      <ChevronDown size={14} className="text-primary" />
    );
  };

  const columns: { key: string; label: string; sortable: boolean }[] = [
    { key: 'photo', label: '', sortable: false },
    { key: 'lastName', label: 'Apellido', sortable: true },
    { key: 'firstName', label: 'Nombre', sortable: true },
    { key: 'nickName', label: 'Apodo', sortable: false },
    { key: 'position', label: 'Posición', sortable: true },
    { key: 'alternatePosition', label: 'Pos. Alt.', sortable: false },
  ];

  return (
    <div className="p-6 space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-ink">Plantel</h1>
          {data && (
            <p className="text-sm text-muted mt-0.5">
              {data.total} jugador{data.total !== 1 ? 'es' : ''}
            </p>
          )}
        </div>
        <button
          onClick={() => setDialogOpen(true)}
          className="flex items-center gap-2 px-4 py-2 bg-primary text-white
                     rounded-lg text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          <Plus size={16} />
          Agregar jugador
        </button>
      </div>

      {/* Filtros */}
      <PlayerFilters filters={filters} onFiltersChange={handleFiltersChange} />

      {/* Tabla */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden shadow-sm">
        {(isLoading || isFetching) && (
          <div className="flex items-center gap-2 px-4 py-2 bg-primary/5 border-b border-border text-xs text-muted">
            <Loader2 size={12} className="animate-spin" />
            Cargando...
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background-light">
                {columns.map((col) => (
                  <th
                    key={col.key}
                    className={`px-4 py-3 text-left text-xs font-semibold text-muted uppercase tracking-wide
                                ${col.sortable ? 'cursor-pointer hover:text-ink select-none' : ''}`}
                    onClick={col.sortable ? () => handleSort(col.key) : undefined}
                  >
                    <div className="flex items-center gap-1">
                      {col.label}
                      {col.sortable && <SortIcon column={col.key} />}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                Array.from({ length: size }).map((_, i) => (
                  <tr key={i} className="border-b border-border/50">
                    {columns.map((col) => (
                      <td key={col.key} className="px-4 py-3">
                        <div className="h-4 bg-border/40 rounded animate-pulse" />
                      </td>
                    ))}
                  </tr>
                ))
              ) : data?.items.length === 0 ? (
                <tr>
                  <td
                    colSpan={columns.length}
                    className="px-4 py-10 text-center text-muted"
                  >
                    No se encontraron jugadores
                  </td>
                </tr>
              ) : (
                data?.items.map((player: Player) => (
                  <tr
                    key={player._id}
                    onClick={() => navigate(`/players/${player._id}`)}
                    className="border-b border-border/50 hover:bg-background-light
                               cursor-pointer transition-colors"
                  >
                    {/* Foto */}
                    <td className="px-4 py-3 w-10">
                      <div className="w-8 h-8 rounded-full overflow-hidden bg-border flex items-center justify-center">
                        {player.photoId ? (
                          <img
                            src={getPlayerPhotoUrl(player._id)}
                            alt={player.firstName}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                        ) : (
                          <span className="text-xs font-medium text-muted">
                            {player.firstName[0]}{player.lastName[0]}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-ink">
                      {player.lastName}
                    </td>
                    <td className="px-4 py-3 text-ink">{player.firstName}</td>
                    <td className="px-4 py-3 text-muted">
                      {player.nickName ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-navy/10 text-navy">
                        {player.position}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-muted text-xs">
                      {player.alternatePosition ?? '—'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {data && totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-border bg-background-light">
            <div className="flex items-center gap-2 text-sm text-muted">
              <span>Filas por página:</span>
              <select
                value={size}
                onChange={(e) => {
                  setSize(Number(e.target.value));
                  setPage(1);
                }}
                className="border border-border rounded px-2 py-1 text-sm bg-surface focus:outline-none"
              >
                {PAGE_SIZES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1">
              <button
                onClick={() => setPage(1)}
                disabled={page === 1}
                className="px-2 py-1 text-sm rounded hover:bg-border/50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                «
              </button>
              <button
                onClick={() => setPage((p) => p - 1)}
                disabled={page === 1}
                className="px-2 py-1 text-sm rounded hover:bg-border/50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ‹
              </button>
              <span className="px-3 py-1 text-sm text-ink">
                {page} / {totalPages}
              </span>
              <button
                onClick={() => setPage((p) => p + 1)}
                disabled={page === totalPages}
                className="px-2 py-1 text-sm rounded hover:bg-border/50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                ›
              </button>
              <button
                onClick={() => setPage(totalPages)}
                disabled={page === totalPages}
                className="px-2 py-1 text-sm rounded hover:bg-border/50 disabled:opacity-40 disabled:cursor-not-allowed"
              >
                »
              </button>
            </div>

            <span className="text-sm text-muted">
              {(page - 1) * size + 1}–{Math.min(page * size, data.total)} de {data.total}
            </span>
          </div>
        )}
      </div>

      {/* Dialog para crear jugador */}
      <PlayerDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
      />
    </div>
  );
}
