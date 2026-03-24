import { ExerciseCategoryEnum, RoutineStatusEnum, SportEnum } from '@ltrc-campo/shared-api-model';

export function getSportLabel(sport?: SportEnum | string): string {
  const labels: Record<string, string> = {
    rugby: 'Rugby',
    hockey: 'Hockey',
  };
  return sport ? labels[sport] ?? sport : '';
}

export function getExerciseCategoryLabel(cat?: ExerciseCategoryEnum | string): string {
  const labels: Record<string, string> = {
    strength: 'Fuerza',
    cardio: 'Cardio',
    mobility: 'Movilidad',
    speed: 'Velocidad',
    technical: 'Técnico',
    recovery: 'Recuperación',
  };
  return cat ? labels[cat] ?? cat : '';
}

export function getRoutineStatusLabel(status?: RoutineStatusEnum | string): string {
  const labels: Record<string, string> = {
    draft: 'Borrador',
    active: 'Activa',
    completed: 'Completada',
    archived: 'Archivada',
  };
  return status ? labels[status] ?? status : '';
}

export const exerciseCategoryOptions = Object.values(ExerciseCategoryEnum).map((value) => ({
  value,
  label: getExerciseCategoryLabel(value),
}));

export const routineStatusOptions = Object.values(RoutineStatusEnum).map((value) => ({
  value,
  label: getRoutineStatusLabel(value),
}));
