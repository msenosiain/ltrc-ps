import { CategoryEnum, HockeyBranchEnum, Role, SportEnum } from '@ltrc-ps/shared-api-model';

export interface User {
  id?: string;
  googleId?: string;
  sub?: string;
  email: string;
  name: string;
  memberNumber?: string;
  roles: Role[];
  hasPassword?: boolean;
  sports?: SportEnum[];
  categories?: CategoryEnum[];
  branches?: HockeyBranchEnum[];
}
