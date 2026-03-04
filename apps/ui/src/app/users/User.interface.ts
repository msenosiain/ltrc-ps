import { CategoryEnum, Role, SportEnum } from '@ltrc-ps/shared-api-model';

export interface User {
  id?: string;
  googleId?: string;
  sub?: string;
  email: string;
  name: string;
  lastName: string;
  roles: Role[];
  hasPassword?: boolean;
  sports?: SportEnum[];
  categories?: CategoryEnum[];
}
