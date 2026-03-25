import {
  PlayerAvailabilityEnum,
  PlayerStatusEnum,
} from '@ltrc-campo/shared-api-model';

export const playerStatusOptions: { id: PlayerStatusEnum; label: string }[] = [
  { id: PlayerStatusEnum.ACTIVE, label: 'Activo' },
  { id: PlayerStatusEnum.INACTIVE, label: 'Inactivo' },
  { id: PlayerStatusEnum.TRIAL, label: 'A prueba' },
];

export const playerAvailabilityOptions: {
  id: PlayerAvailabilityEnum;
  label: string;
}[] = [
  { id: PlayerAvailabilityEnum.AVAILABLE, label: 'Disponible' },
  { id: PlayerAvailabilityEnum.INJURED, label: 'Lesionado' },
  { id: PlayerAvailabilityEnum.CALLED_UP, label: 'Convocado' },
  { id: PlayerAvailabilityEnum.SUSPENDED, label: 'Suspendido' },
  { id: PlayerAvailabilityEnum.LEAVE, label: 'Licencia' },
  { id: PlayerAvailabilityEnum.NOT_PLAYING, label: 'No juega' },
];

export function getStatusLabel(status?: PlayerStatusEnum): string {
  if (!status) return 'Activo';
  return playerStatusOptions.find((o) => o.id === status)?.label ?? status;
}

export function getAvailabilityLabel(
  status?: PlayerAvailabilityEnum
): string {
  if (!status) return 'Disponible';
  return (
    playerAvailabilityOptions.find((o) => o.id === status)?.label ?? status
  );
}

export function getAvailabilityColor(
  status?: PlayerAvailabilityEnum
): string {
  switch (status) {
    case PlayerAvailabilityEnum.INJURED:
      return '#e53935';   // rojo
    case PlayerAvailabilityEnum.SUSPENDED:
      return '#f57c00';   // naranja
    case PlayerAvailabilityEnum.CALLED_UP:
      return '#5c35bb';   // violeta
    case PlayerAvailabilityEnum.LEAVE:
      return '#6a1b9a';   // violeta oscuro
    case PlayerAvailabilityEnum.NOT_PLAYING:
      return '#757575';   // gris
    default:
      return '#2e7d32';   // verde (disponible)
  }
}
