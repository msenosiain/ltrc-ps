import { Role } from '../auth/roles.enum';

export const roleOptions = [
  { id: Role.ADMIN, label: 'Administrador' },
  { id: Role.USER, label: 'Usuario' },
  { id: Role.PLAYER, label: 'Jugador' },
];

export function getRoleLabel(role: Role): string {
  return roleOptions.find((o) => o.id === role)?.label ?? role;
}
