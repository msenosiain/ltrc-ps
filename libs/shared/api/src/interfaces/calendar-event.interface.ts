import { CategoryEnum } from '../enums/category.enum';
import { SportEnum } from '../enums/sport.enum';

export interface CalendarEvent {
  type: 'match' | 'training';
  id: string;
  date: string; // ISO datetime string (UTC) for matches; YYYY-MM-DDT12:00:00 for trainings
  startTime?: string; // HH:mm — only for trainings
  title: string;
  sport?: SportEnum;
  category: CategoryEnum;
  status: string;
  isHome?: boolean;
  location?: string;
}
