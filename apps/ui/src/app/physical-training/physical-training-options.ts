import { ExerciseCategoryEnum, ExerciseTrackingTypeEnum, WorkoutStatusEnum, SportEnum } from '@ltrc-campo/shared-api-model';

const T = ExerciseTrackingTypeEnum;

export interface TrackingTypeInfo {
  measureField: 'reps' | 'duration' | 'distance';
  measureLabel: string;
  measureSuffix: string;
  showLoad: boolean;
  loadLabel: string;
  eachSide: boolean;
}

const TRACKING_TYPE_INFO: Record<ExerciseTrackingTypeEnum, TrackingTypeInfo> = {
  [T.WEIGHT_REPS]:       { measureField: 'reps',     measureLabel: 'Reps',      measureSuffix: 'reps', showLoad: true,  loadLabel: 'Carga',       eachSide: false },
  [T.WEIGHT_REPS_EACH]:  { measureField: 'reps',     measureLabel: 'Reps',      measureSuffix: 'reps', showLoad: true,  loadLabel: 'Carga',       eachSide: true  },
  [T.BODYWEIGHT_REPS]:   { measureField: 'reps',     measureLabel: 'Reps',      measureSuffix: 'reps', showLoad: false, loadLabel: '',            eachSide: false },
  [T.BODYWEIGHT_LOADED]: { measureField: 'reps',     measureLabel: 'Reps',      measureSuffix: 'reps', showLoad: true,  loadLabel: 'Carga extra', eachSide: false },
  [T.ASSISTED]:          { measureField: 'reps',     measureLabel: 'Reps',      measureSuffix: 'reps', showLoad: true,  loadLabel: 'Asistencia',  eachSide: false },
  [T.TIME]:              { measureField: 'duration', measureLabel: 'Duración',  measureSuffix: 'seg',  showLoad: false, loadLabel: '',            eachSide: false },
  [T.TIME_EACH]:         { measureField: 'duration', measureLabel: 'Duración',  measureSuffix: 'seg',  showLoad: false, loadLabel: '',            eachSide: true  },
  [T.DISTANCE]:          { measureField: 'distance', measureLabel: 'Distancia', measureSuffix: '',     showLoad: false, loadLabel: '',            eachSide: false },
};

export function getTrackingTypeInfo(type?: ExerciseTrackingTypeEnum | string): TrackingTypeInfo {
  return TRACKING_TYPE_INFO[type as ExerciseTrackingTypeEnum] ?? TRACKING_TYPE_INFO[T.WEIGHT_REPS];
}

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

export const exerciseTrackingTypeOptions = [
  { value: T.WEIGHT_REPS,       label: 'Peso + repeticiones (ej. sentadilla)' },
  { value: T.WEIGHT_REPS_EACH,  label: 'Peso + repeticiones por lado (ej. curl bíceps)' },
  { value: T.BODYWEIGHT_REPS,   label: 'Peso corporal + repeticiones (ej. flexiones)' },
  { value: T.BODYWEIGHT_LOADED, label: 'Peso corporal en volumen (ej. dominadas)' },
  { value: T.ASSISTED,          label: 'Asistido (ej. dominadas asistidas)' },
  { value: T.TIME,              label: 'Tiempo (ej. plancha)' },
  { value: T.TIME_EACH,         label: 'Tiempo por lado (ej. plancha lateral)' },
  { value: T.DISTANCE,          label: 'Distancia (ej. correr, remo)' },
];

export const workoutStatusOptions = Object.values(WorkoutStatusEnum).map((value) => ({
  value,
  label: getWorkoutStatusLabel(value),
}));
