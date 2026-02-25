import type { SubCategoria } from '../../utils/types';

interface Props {
  subcategorias: SubCategoria[];
  onSelect?: (id: string) => void;
}

export function SubcategoriaChips({ subcategorias, onSelect }: Props) {
  return (
    <div className="flex flex-wrap gap-2">
      {subcategorias.map((sub) => (
        <button
          key={sub.id}
          onClick={() => onSelect?.(sub.id)}
          className="px-3 py-1 rounded-full border border-border text-sm text-ink
                     bg-surface hover:bg-navy/10 hover:border-navy/30 transition-colors"
        >
          {sub.label}
        </button>
      ))}
    </div>
  );
}
