import { SetMetadata } from '@nestjs/common';
import { RolEnum } from '@ltrc-ps/shared-api-model';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: RolEnum[]) => SetMetadata(ROLES_KEY, roles);
