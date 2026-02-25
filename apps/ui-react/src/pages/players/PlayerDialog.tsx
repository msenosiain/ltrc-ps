import * as Dialog from '@radix-ui/react-dialog';
import { X } from 'lucide-react';
import { PlayerForm, type PlayerFormValues } from './PlayerForm';
import { useCreatePlayer, useUpdatePlayer } from '../../queries/usePlayerMutations';
import type { Player } from '../../domain/player';

interface PlayerDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  player?: Player;
}

export function PlayerDialog({ open, onOpenChange, player }: PlayerDialogProps) {
  const isEditing = !!player;
  const createMutation = useCreatePlayer();
  const updateMutation = useUpdatePlayer(player?._id ?? '');

  const mutation = isEditing ? updateMutation : createMutation;

  const handleSubmit = (data: PlayerFormValues, photo?: File) => {
    mutation.mutate(
      { data, photo },
      {
        onSuccess: () => onOpenChange(false),
      }
    );
  };

  return (
    <Dialog.Root open={open} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/40 z-40" />
        <Dialog.Content
          className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2
                     z-50 w-full max-w-2xl max-h-[90vh] overflow-y-auto
                     bg-surface rounded-2xl shadow-xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <Dialog.Title className="text-lg font-semibold text-ink">
              {isEditing ? 'Editar jugador' : 'Nuevo jugador'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button className="p-1 rounded-lg hover:bg-border/50 transition-colors">
                <X size={18} className="text-muted" />
              </button>
            </Dialog.Close>
          </div>

          <PlayerForm
            initialData={player}
            onSubmit={handleSubmit}
            isSubmitting={mutation.isPending}
            submitLabel={isEditing ? 'Actualizar' : 'Crear jugador'}
          />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
