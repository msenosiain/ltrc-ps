import { CategoryEnum } from '../enums/category.enum';
import { HockeyBranchEnum } from '../enums/hockey-branch.enum';
import { SportEnum } from '../enums/sport.enum';

export interface BranchAssignment {
  id?: string;
  player: string;
  branch: HockeyBranchEnum;
  category: CategoryEnum;
  season: number;
  sport: SportEnum;
  assignedBy?: string;
  assignedAt: Date;
}

export interface BranchAssignmentFilters {
  player?: string;
  branch?: HockeyBranchEnum;
  category?: CategoryEnum;
  season?: number;
}
