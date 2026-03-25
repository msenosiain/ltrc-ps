import {
  CategoryEnum,
  MatchStatusEnum,
  SportEnum,
} from '@ltrc-campo/shared-api-model';


export interface MatchFormValue {
  date: Date | null;
  opponent: string;
  venue: string;
  isHome: boolean;
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
  sport?: SportEnum;
  category?: CategoryEnum;
  division?: string;
  tournament?: string;
  opponent?: string;
  fromDate?: string;
  toDate?: string;
  playerId?: string;
}
