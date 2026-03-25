import { CategoryEnum } from '../enums/category.enum';
import { HockeyBranchEnum } from '../enums/hockey-branch.enum';
import { SportEnum } from '../enums/sport.enum';

export interface CalendarEvent {
  type: 'match' | 'training';
  id: string;
  date: string; // ISO datetime string (UTC) for matches; YYYY-MM-DDT12:00:00 for trainings
  startTime?: string; // HH:mm — only for trainings
  title: string;
  sport?: SportEnum;
  category: CategoryEnum;
  branch?: HockeyBranchEnum;
  division?: string;
  status: string;
  opponent?: string;
  isHome?: boolean;
  location?: string;
}
