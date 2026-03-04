import { Role } from '@ltrc-ps/shared-api-model';

export const roleOptions = [
  { id: Role.ADMIN, label: 'Administrador' },
  { id: Role.MANAGER, label: 'Manager' },
  { id: Role.PLAYER, label: 'Jugador' },
  { id: Role.COACH, label: 'Entrenador' },
  { id: Role.TRAINER, label: 'Preparador Físico' },
];

export function getRoleLabel(role: Role): string {
  return roleOptions.find((o) => o.id === role)?.label ?? role;
}

export function getRoleClass(role: Role): string {
  switch (role) {
    case Role.ADMIN:
      return 'role-chip--admin';
    case Role.MANAGER:
      return 'role-chip--manager';
    case Role.PLAYER:
      return 'role-chip--player';
    case Role.COACH:
      return 'role-chip--coach';
    case Role.TRAINER:
      return 'role-chip--trainer';
    default:
      return 'role-chip--default';
  }
}
