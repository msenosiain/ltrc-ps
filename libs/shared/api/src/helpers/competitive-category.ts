import { CategoryEnum } from '../enums/category.enum';
import { SportEnum } from '../enums/sport.enum';

const COMPETITIVE_RUGBY: ReadonlySet<CategoryEnum> = new Set([
  CategoryEnum.PLANTEL_SUPERIOR,
  CategoryEnum.M19,
  CategoryEnum.M17,
  CategoryEnum.M16,
  CategoryEnum.M15,
]);

const COMPETITIVE_HOCKEY: ReadonlySet<CategoryEnum> = new Set([
  CategoryEnum.PLANTEL_SUPERIOR,
  CategoryEnum.CUARTA,
  CategoryEnum.QUINTA,
  CategoryEnum.SEXTA,
]);

export function isCompetitiveCategory(
  category: CategoryEnum,
  sport: SportEnum
): boolean {
  if (sport === SportEnum.RUGBY) return COMPETITIVE_RUGBY.has(category);
  if (sport === SportEnum.HOCKEY) return COMPETITIVE_HOCKEY.has(category);
  return false;
}
