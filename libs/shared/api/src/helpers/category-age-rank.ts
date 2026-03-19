import { CategoryEnum } from '../enums';

/**
 * Orden etario de las categorías (de menor a mayor).
 * Rugby: M5–M19, Hockey: pre_decima–cuarta, Compartido: plantel_superior.
 * MASTER no está en el ranking (adultos mayores, sin restricción de mezcla).
 */
export const CATEGORY_AGE_RANK: Partial<Record<CategoryEnum, number>> = {
  // Rugby
  [CategoryEnum.M5]: 0,
  [CategoryEnum.M6]: 1,
  [CategoryEnum.M7]: 2,
  [CategoryEnum.M8]: 3,
  [CategoryEnum.M9]: 4,
  [CategoryEnum.M10]: 5,
  [CategoryEnum.M11]: 6,
  [CategoryEnum.M12]: 7,
  [CategoryEnum.M13]: 8,
  [CategoryEnum.M14]: 9,
  [CategoryEnum.M15]: 10,
  [CategoryEnum.M16]: 11,
  [CategoryEnum.M17]: 12,
  [CategoryEnum.M19]: 13,
  // Hockey (pre_decima = más joven)
  [CategoryEnum.PRE_DECIMA]: 0,
  [CategoryEnum.DECIMA]: 1,
  [CategoryEnum.NOVENA]: 2,
  [CategoryEnum.OCTAVA]: 3,
  [CategoryEnum.SEPTIMA]: 4,
  [CategoryEnum.SEXTA]: 5,
  [CategoryEnum.QUINTA]: 6,
  [CategoryEnum.CUARTA]: 7,
  // Adultos (ambos deportes)
  [CategoryEnum.PLANTEL_SUPERIOR]: 14,
};

/** Gap máximo de ranking etario permitido dentro de un mismo transporte */
export const MAX_CATEGORY_AGE_GAP = 3;
