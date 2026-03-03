import {Role} from '../auth/roles.enum';

export interface User {
  id?: string;
  googleId?: string;
  sub?: string;
  email: string;
  name: string;
  lastName: string;
  roles: Role[];
}
