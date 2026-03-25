import { MatchFormValue } from './match-form.types';

export function mapFormToCreateMatchDto(value: MatchFormValue) {
  const hasResult =
    value.result?.homeScore != null && value.result?.awayScore != null;

  return {
    date: value.date!.toISOString(),
    opponent: value.opponent || undefined,
    venue: value.venue,
    isHome: value.isHome,
    status: value.status,
    sport: value.sport || undefined,
    category: value.category!,
    division: value.division || undefined,
    branch: value.branch || undefined,
    name: value.name || undefined,
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
