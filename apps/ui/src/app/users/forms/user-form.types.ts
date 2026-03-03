import { Role } from '../../auth/roles.enum';

export type UserFormValue = {
  name: string;
  lastName: string;
  email: string;
  roles: Role[];
  password?: string;
};

export type UserFilters = {
  searchTerm?: string;
  role?: Role;
};
