import { useCallback } from 'react';
import { useDebounce } from 'use-debounce';
import { Search, X } from 'lucide-react';
import { POSITION_OPTIONS } from '../../domain/player-positions';
import type { PlayerFilters as Filters } from '../../domain/player';

interface PlayerFiltersProps {
  filters: Filters;
  onFiltersChange: (filters: Filters) => void;
}

export function PlayerFilters({ filters, onFiltersChange }: PlayerFiltersProps) {
  const [, { flush }] = useDebounce(filters.searchTerm, 400);

  const handleSearch = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      onFiltersChange({ ...filters, searchTerm: e.target.value });
      flush();
    },
    [filters, onFiltersChange, flush]
  );

  const handlePosition = useCallback(
    (e: React.ChangeEvent<HTMLSelectElement>) => {
      onFiltersChange({
        ...filters,
        position: e.target.value as Filters['position'] || undefined,
      });
    },
    [filters, onFiltersChange]
  );

  const handleClear = useCallback(() => {
    onFiltersChange({ searchTerm: '', position: undefined });
  }, [onFiltersChange]);

  const hasFilters = filters.searchTerm || filters.position;

  return (
    <div className="flex flex-wrap gap-3 items-center">
      {/* Búsqueda por texto */}
      <div className="relative flex-1 min-w-[200px]">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-muted pointer-events-none"
        />
        <input
          type="text"
          placeholder="Buscar jugador..."
          value={filters.searchTerm ?? ''}
          onChange={handleSearch}
          className="w-full pl-9 pr-4 py-2 border border-border rounded-lg text-sm
                     bg-surface focus:outline-none focus:ring-2 focus:ring-primary/30
                     focus:border-primary transition-colors"
        />
      </div>

      {/* Filtro por posición */}
      <select
        value={filters.position ?? ''}
        onChange={handlePosition}
        className="py-2 px-3 border border-border rounded-lg text-sm bg-surface
                   focus:outline-none focus:ring-2 focus:ring-primary/30
                   focus:border-primary transition-colors cursor-pointer min-w-[180px]"
      >
        <option value="">Todas las posiciones</option>
        {POSITION_OPTIONS.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>

      {/* Limpiar filtros */}
      {hasFilters && (
        <button
          onClick={handleClear}
          className="flex items-center gap-1 px-3 py-2 text-sm text-muted
                     hover:text-ink transition-colors rounded-lg hover:bg-border/50"
        >
          <X size={14} />
          Limpiar
        </button>
      )}
    </div>
  );
}
