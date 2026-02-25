import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { usePlayer } from '../../queries/usePlayer';
import { useUpdatePlayer } from '../../queries/usePlayerMutations';
import { PlayerForm } from './PlayerForm';

export function PlayerEditPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: player, isLoading } = usePlayer(id);
  const updateMutation = useUpdatePlayer(id ?? '');

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        <div className="h-8 w-48 bg-border/40 rounded animate-pulse" />
        <div className="h-96 bg-border/20 rounded-xl animate-pulse" />
      </div>
    );
  }

  if (!player) {
    return (
      <div className="p-6 text-center text-muted">Jugador no encontrado</div>
    );
  }

  return (
    <div className="p-6 space-y-5 max-w-2xl">
      {/* Header */}
      <div className="flex items-center gap-4">
        <button
          onClick={() => navigate(`/players/${id}`)}
          className="flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft size={16} />
          Cancelar
        </button>
        <h1 className="text-2xl font-semibold text-ink">
          Editar — {player.firstName} {player.lastName}
        </h1>
      </div>

      <PlayerForm
        initialData={player}
        onSubmit={(data, photo) => updateMutation.mutate({ data, photo })}
        isSubmitting={updateMutation.isPending}
        submitLabel="Guardar cambios"
      />
    </div>
  );
}
