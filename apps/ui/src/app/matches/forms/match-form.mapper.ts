import { format } from 'date-fns';
import { DATE_FORMAT } from '@ltrc-ps/shared-api-model';
import { MatchFormValue } from './match-form.types';

export function mapFormToCreateMatchDto(value: MatchFormValue) {
  const hasResult =
    value.result?.homeScore != null && value.result?.awayScore != null;

  const date = value.date!;
  const h = date.getHours();
  const m = date.getMinutes();

  return {
    date: format(date, h || m ? `${DATE_FORMAT} HH:mm` : DATE_FORMAT),
    opponent: value.opponent,
    venue: value.venue,
    isHome: value.isHome,
    type: value.type!,
    status: value.status,
    sport: value.sport ?? undefined,
    category: value.category ?? undefined,
    division: value.division || undefined,
    tournament: value.tournament || undefined,
    result: hasResult
      ? {
          homeScore: value.result.homeScore!,
          awayScore: value.result.awayScore!,
        }
      : undefined,
    notes: value.notes || undefined,
  };
}
