import { RoleEnum } from '@ltrc-campo/shared-api-model';

export const roleOptions = [
  { id: RoleEnum.ADMIN, label: 'Administrador' },
  { id: RoleEnum.MANAGER, label: 'Manager' },
  { id: RoleEnum.ANALYST, label: 'Analista' },
  { id: RoleEnum.KINE, label: 'Kinesiólogo' },
  { id: RoleEnum.PLAYER, label: 'Jugador' },
  { id: RoleEnum.COACH, label: 'Entrenador' },
  { id: RoleEnum.TRAINER, label: 'Preparador Físico' },
];

export function getRoleLabel(role: RoleEnum): string {
  return roleOptions.find((o) => o.id === role)?.label ?? role;
}

export function getRoleClass(role: RoleEnum): string {
  switch (role) {
    case RoleEnum.ADMIN:
      return 'role-chip--admin';
    case RoleEnum.MANAGER:
      return 'role-chip--manager';
    case RoleEnum.ANALYST:
      return 'role-chip--analyst';
    case RoleEnum.KINE:
      return 'role-chip--kine';
    case RoleEnum.PLAYER:
      return 'role-chip--player';
    case RoleEnum.COACH:
      return 'role-chip--coach';
    case RoleEnum.TRAINER:
      return 'role-chip--trainer';
    default:
      return 'role-chip--default';
  }
}
