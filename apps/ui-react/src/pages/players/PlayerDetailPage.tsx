import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, User } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { usePlayer } from '../../queries/usePlayer';
import { useDeletePlayer } from '../../queries/usePlayerMutations';
import { getPlayerPhotoUrl } from '../../services/Players.service';
import { useDivisiones } from '../../queries/useDivisiones';
import { useEquipos } from '../../queries/useEquipos';

type TabId = 'personal' | 'indumentaria';

export function PlayerDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<TabId>('personal');
  const [confirmDelete, setConfirmDelete] = useState(false);

  const { data: player, isLoading } = usePlayer(id);
  const deleteMutation = useDeletePlayer();
  const { data: divisiones = [] } = useDivisiones();
  const { data: equipos = [] } = useEquipos(player?.divisionId);

  const handleDelete = () => {
    if (!id) return;
    deleteMutation.mutate(id);
  };

  const fieldClass = 'text-sm text-ink';
  const labelClass = 'text-xs text-muted font-medium uppercase tracking-wide';

  if (isLoading) {
    return (
      <div className="p-6 space-y-4">
        {/* Skeleton */}
        <div className="h-8 w-48 bg-border/40 rounded animate-pulse" />
        <div className="flex gap-4">
          <div className="w-24 h-24 rounded-full bg-border/40 animate-pulse" />
          <div className="flex-1 space-y-3">
            <div className="h-6 w-64 bg-border/40 rounded animate-pulse" />
            <div className="h-4 w-40 bg-border/40 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (!player) {
    return (
      <div className="p-6 text-center text-muted">Jugador no encontrado</div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-3xl">
      {/* Header con acciones */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/players')}
          className="flex items-center gap-2 text-sm text-muted hover:text-ink transition-colors"
        >
          <ArrowLeft size={16} />
          Volver al plantel
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate(`/players/${id}/edit`)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-border
                       rounded-lg hover:bg-border/30 transition-colors"
          >
            <Edit size={14} />
            Editar
          </button>
          <button
            onClick={() => setConfirmDelete(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm border border-red-200
                       text-red-500 rounded-lg hover:bg-red-50 transition-colors"
          >
            <Trash2 size={14} />
            Eliminar
          </button>
        </div>
      </div>

      {/* Perfil */}
      <div className="flex items-center gap-5">
        <div className="w-24 h-24 rounded-full overflow-hidden bg-border flex items-center justify-center flex-shrink-0">
          {player.photoId ? (
            <img
              src={getPlayerPhotoUrl(player._id)}
              alt={`${player.firstName} ${player.lastName}`}
              className="w-full h-full object-cover"
            />
          ) : (
            <User size={36} className="text-muted" />
          )}
        </div>
        <div>
          <h1 className="text-2xl font-semibold text-ink">
            {player.firstName} {player.lastName}
          </h1>
          {player.nickName && (
            <p className="text-muted text-sm">"{player.nickName}"</p>
          )}
          <div className="flex items-center gap-2 mt-2 flex-wrap">
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-navy text-white">
              {player.position}
            </span>
            {player.alternatePosition && (
              <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium bg-navy/20 text-navy">
                {player.alternatePosition}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div>
        <div className="flex border-b border-border">
          {(['personal', 'indumentaria'] as TabId[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-5 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px
                ${activeTab === tab
                  ? 'border-interactive text-interactive'
                  : 'border-transparent text-muted hover:text-ink'}`}
            >
              {tab === 'personal' ? 'Datos personales' : 'Indumentaria'}
            </button>
          ))}
        </div>

        {/* Tab: Datos personales */}
        {activeTab === 'personal' && (
          <div className="pt-5 space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className={labelClass}>DNI</p>
                <p className={fieldClass}>{player.idNumber}</p>
              </div>
              <div>
                <p className={labelClass}>Email</p>
                <p className={fieldClass}>{player.email}</p>
              </div>
              {player.birthDate && (
                <div>
                  <p className={labelClass}>Fecha de nacimiento</p>
                  <p className={fieldClass}>
                    {format(new Date(player.birthDate), 'dd/MM/yyyy', { locale: es })}
                  </p>
                </div>
              )}
              {player.height && (
                <div>
                  <p className={labelClass}>Altura</p>
                  <p className={fieldClass}>{player.height} cm</p>
                </div>
              )}
              {player.weight && (
                <div>
                  <p className={labelClass}>Peso</p>
                  <p className={fieldClass}>{player.weight} kg</p>
                </div>
              )}
            </div>

            {(player.divisionId || player.equipoId) && (
              <div className="col-span-2 grid grid-cols-2 gap-4">
                {player.divisionId && (
                  <div>
                    <p className={labelClass}>División</p>
                    <p className={fieldClass}>
                      {divisiones.find((d) => d.id === player.divisionId)?.name ?? player.divisionId}
                    </p>
                  </div>
                )}
                {player.equipoId && (
                  <div>
                    <p className={labelClass}>Equipo</p>
                    <p className={fieldClass}>
                      {equipos.find((e) => e.id === player.equipoId)?.name ?? player.equipoId}
                    </p>
                  </div>
                )}
              </div>
            )}

            {player.address && (
              <div>
                <h3 className="text-sm font-semibold text-ink mb-3">Domicilio</h3>
                <div className="grid grid-cols-2 gap-3">
                  {player.address.street && (
                    <div>
                      <p className={labelClass}>Dirección</p>
                      <p className={fieldClass}>
                        {player.address.street} {player.address.number}
                        {player.address.floor ? `, piso ${player.address.floor}` : ''}
                        {player.address.apartment ? ` dpto ${player.address.apartment}` : ''}
                      </p>
                    </div>
                  )}
                  {player.address.city && (
                    <div>
                      <p className={labelClass}>Ciudad</p>
                      <p className={fieldClass}>
                        {player.address.city}
                        {player.address.province ? `, ${player.address.province}` : ''}
                      </p>
                    </div>
                  )}
                  {player.address.phoneNumber && (
                    <div>
                      <p className={labelClass}>Teléfono</p>
                      <p className={fieldClass}>{player.address.phoneNumber}</p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab: Indumentaria */}
        {activeTab === 'indumentaria' && (
          <div className="pt-5">
            {player.clothingSizes ? (
              <div className="grid grid-cols-2 gap-4">
                {([
                  ['jersey', 'Camiseta'],
                  ['shorts', 'Short'],
                  ['sweater', 'Buzo'],
                  ['pants', 'Pantalón'],
                ] as const).map(([key, label]) => (
                  <div key={key}>
                    <p className={labelClass}>{label}</p>
                    <p className={fieldClass}>
                      {player.clothingSizes?.[key] ?? '—'}
                    </p>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted text-sm">Sin datos de indumentaria</p>
            )}
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {confirmDelete && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center">
          <div className="bg-surface rounded-2xl shadow-xl p-6 max-w-sm w-full mx-4">
            <h3 className="text-lg font-semibold text-ink mb-2">
              ¿Eliminar jugador?
            </h3>
            <p className="text-sm text-muted mb-5">
              Se eliminará a <strong>{player.firstName} {player.lastName}</strong> permanentemente. Esta acción no se puede deshacer.
            </p>
            <div className="flex gap-3 justify-end">
              <button
                onClick={() => setConfirmDelete(false)}
                className="px-4 py-2 text-sm border border-border rounded-lg hover:bg-border/30 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg
                           hover:bg-red-600 disabled:opacity-60 transition-colors"
              >
                {deleteMutation.isPending ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
