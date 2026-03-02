import { CategoryEnum, SportEnum } from '@ltrc-ps/shared-api-model';

export interface CategoryOption {
  id: CategoryEnum;
  label: string;
  /** null = aplica a todos los deportes */
  sport: SportEnum | null;
}

// sport: null → disponible en ambos deportes
const categoryDefs: CategoryOption[] = [
  { id: CategoryEnum.PLANTEL_SUPERIOR, label: 'Plantel Superior', sport: null },
  // Rugby
  { id: CategoryEnum.M19, label: 'M19', sport: SportEnum.RUGBY },
  { id: CategoryEnum.M17, label: 'M17', sport: SportEnum.RUGBY },
  { id: CategoryEnum.M16, label: 'M16', sport: SportEnum.RUGBY },
  { id: CategoryEnum.M15, label: 'M15', sport: SportEnum.RUGBY },
  { id: CategoryEnum.M14, label: 'M14', sport: SportEnum.RUGBY },
  { id: CategoryEnum.M13, label: 'M13', sport: SportEnum.RUGBY },
  { id: CategoryEnum.M12, label: 'M12', sport: SportEnum.RUGBY },
  { id: CategoryEnum.M11, label: 'M11', sport: SportEnum.RUGBY },
  { id: CategoryEnum.M10, label: 'M10', sport: SportEnum.RUGBY },
  { id: CategoryEnum.M9, label: 'M9', sport: SportEnum.RUGBY },
  { id: CategoryEnum.M8, label: 'M8', sport: SportEnum.RUGBY },
  { id: CategoryEnum.M7, label: 'M7', sport: SportEnum.RUGBY },
  { id: CategoryEnum.M6, label: 'M6', sport: SportEnum.RUGBY },
  { id: CategoryEnum.M5, label: 'M5', sport: SportEnum.RUGBY },
  // Hockey
  { id: CategoryEnum.CUARTA, label: '4ta', sport: SportEnum.HOCKEY },
  { id: CategoryEnum.QUINTA, label: '5ta', sport: SportEnum.HOCKEY },
  { id: CategoryEnum.SEXTA, label: '6ta', sport: SportEnum.HOCKEY },
  { id: CategoryEnum.SEPTIMA, label: '7ma', sport: SportEnum.HOCKEY },
  { id: CategoryEnum.OCTAVA, label: '8va', sport: SportEnum.HOCKEY },
  { id: CategoryEnum.NOVENA, label: '9na', sport: SportEnum.HOCKEY },
  { id: CategoryEnum.DECIMA, label: '10ma', sport: SportEnum.HOCKEY },
  { id: CategoryEnum.PRE_DECIMA, label: 'Pre-décima', sport: SportEnum.HOCKEY },
  { id: CategoryEnum.MASTER, label: 'Máster', sport: SportEnum.HOCKEY },
];

export const categoryOptions: CategoryOption[] = categoryDefs;

export function getCategoryOptionsBySport(
  sport?: SportEnum | null
): CategoryOption[] {
  if (!sport) return categoryDefs;
  return categoryDefs.filter((c) => c.sport === null || c.sport === sport);
}

export function getCategoryLabel(id?: CategoryEnum | null): string {
  if (!id) return '';
  return categoryDefs.find((c) => c.id === id)?.label ?? id;
}
