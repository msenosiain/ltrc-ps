import { MatchStatusEnum, MatchTypeEnum } from '@ltrc-ps/shared-api-model';

export interface MatchFormValue {
  date: Date | null;
  opponent: string;
  venue: string;
  isHome: boolean;
  type: MatchTypeEnum | null;
  status: MatchStatusEnum;
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
  tournament?: string;
  fromDate?: string;
  toDate?: string;
}