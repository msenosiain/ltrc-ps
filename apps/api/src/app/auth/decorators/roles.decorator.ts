import { SetMetadata } from '@nestjs/common';
import { Role } from '@ltrc-ps/shared-api-model';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: Role[]) => SetMetadata(ROLES_KEY, roles);
