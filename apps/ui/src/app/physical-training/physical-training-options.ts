import { ExerciseCategoryEnum, WorkoutStatusEnum, SportEnum } from '@ltrc-campo/shared-api-model';

export const sportOptions = [
  { value: SportEnum.RUGBY, label: 'Rugby' },
  { value: SportEnum.HOCKEY, label: 'Hockey' },
];

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

export function getWorkoutStatusLabel(status?: WorkoutStatusEnum | string): string {
  const labels: Record<string, string> = {
    draft: 'Borrador',
    active: 'Activo',
    completed: 'Completado',
    archived: 'Archivado',
  };
  return status ? labels[status] ?? status : '';
}

export const exerciseCategoryOptions = Object.values(ExerciseCategoryEnum).map((value) => ({
  value,
  label: getExerciseCategoryLabel(value),
}));

export const workoutStatusOptions = Object.values(WorkoutStatusEnum).map((value) => ({
  value,
  label: getWorkoutStatusLabel(value),
}));
