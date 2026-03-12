import { CategoryEnum, HockeyBranchEnum, RoleEnum, SportEnum } from '@ltrc-ps/shared-api-model';

export type UserFormValue = {
  name: string;
  memberNumber: string;
  email: string;
  roles: RoleEnum[];
  password?: string;
  sports?: SportEnum[];
  categories?: CategoryEnum[];
  branches?: HockeyBranchEnum[];
};

export type UserFilters = {
  searchTerm?: string;
  role?: RoleEnum;
};
