import { Role } from '@ltrc-ps/shared-api-model';

export const roleOptions = [
  { id: Role.ADMIN, label: 'Administrador' },
  { id: Role.MANAGER, label: 'Manager' },
  { id: Role.PLAYER, label: 'Jugador' },
  { id: Role.COACH, label: 'Entrenador' },
];

export function getRoleLabel(role: Role): string {
  return roleOptions.find((o) => o.id === role)?.label ?? role;
}

export function getRoleColor(role: Role): string {
  switch (role) {
    case Role.ADMIN:
      return 'primary';
    case Role.MANAGER:
      return 'accent';
    case Role.PLAYER:
    case Role.COACH:
      return 'accent';
    default:
      return 'primary';
  }
}
