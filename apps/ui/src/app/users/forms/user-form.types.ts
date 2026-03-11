import { CategoryEnum, HockeyBranchEnum, Role, SportEnum } from '@ltrc-ps/shared-api-model';

export type UserFormValue = {
  name: string;
  lastName: string;
  email: string;
  roles: Role[];
  password?: string;
  sports?: SportEnum[];
  categories?: CategoryEnum[];
  branches?: HockeyBranchEnum[];
};

export type UserFilters = {
  searchTerm?: string;
  role?: Role;
};
