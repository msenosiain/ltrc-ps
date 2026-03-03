import {
  CategoryEnum,
  MatchStatusEnum,
  MatchTypeEnum,
  SportEnum,
} from '@ltrc-ps/shared-api-model';

export interface MatchFormValue {
  date: Date | null;
  opponent: string;
  venue: string;
  isHome: boolean;
  type: MatchTypeEnum | null;
  status: MatchStatusEnum;
  sport: SportEnum | null;
  category: CategoryEnum | null;
  division: string;
  tournament: string | null;
  result: {
    homeScore: number | null;
    awayScore: number | null;
  };
  notes: string;
}

export interface MatchFilters {
  status?: MatchStatusEnum;
  type?: MatchTypeEnum;
  sport?: SportEnum;
  category?: CategoryEnum;
  tournament?: string;
  fromDate?: string;
  toDate?: string;
}
