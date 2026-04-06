export enum EvaluationSkillEnum {
  TACKLE  = 'tackle',
  PASE    = 'pase',
  PATADA  = 'patada',
  JUEGO   = 'juego',
  FISICO  = 'fisico',
}

export enum EvaluationLevelEnum {
  EVALUAR      = 'EVALUAR',
  PRINCIPIANTE = 'PRINCIPIANTE',
  INTERMEDIO   = 'INTERMEDIO',
  AVANZADO     = 'AVANZADO',
}

export type EvaluationScore = 0 | 1 | 2 | 3;

// Rugby subcriteria per skill
export const RUGBY_SKILL_CRITERIA: Record<EvaluationSkillEnum, string[]> = {
  [EvaluationSkillEnum.TACKLE]: [
    'Encuadre',
    'Posición',
    'Tracción',
    'Efectivo',
  ],
  [EvaluationSkillEnum.PASE]: [
    'Rota cintura',
    'Estira brazos',
    'Recibe manos adelante',
    'A la carrera',
    'Hacia ambos lados',
  ],
  [EvaluationSkillEnum.PATADA]: [
    'Kick',
    'Drop',
    'Rastrón',
    'Dirección deseada',
    'Ambos pies',
  ],
  [EvaluationSkillEnum.JUEGO]: [
    'Llega a las formaciones',
    'Se desprende de formaciones',
    'Se reposiciona',
    'Toma y conserva marca',
    'Se comunica',
  ],
  [EvaluationSkillEnum.FISICO]: [
    'Velocidad',
    'Reacción',
    'Resistencia',
    'Fuerza',
    'Técnica de carrera',
  ],
};

export function scoreToLevel(avg: number): EvaluationLevelEnum {
  if (avg === 0) return EvaluationLevelEnum.EVALUAR;
  if (avg <= 1)  return EvaluationLevelEnum.PRINCIPIANTE;
  if (avg <= 2)  return EvaluationLevelEnum.INTERMEDIO;
  return EvaluationLevelEnum.AVANZADO;
}
