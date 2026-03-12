import { CategoryEnum } from './enums/category.enum';
import { SportEnum } from './enums/sport.enum';

const RUGBY_CATEGORIES: CategoryEnum[] = [
  CategoryEnum.M5,
  CategoryEnum.M6,
  CategoryEnum.M7,
  CategoryEnum.M8,
  CategoryEnum.M9,
  CategoryEnum.M10,
  CategoryEnum.M11,
  CategoryEnum.M12,
  CategoryEnum.M13,
  CategoryEnum.M14,
  CategoryEnum.M15,
  CategoryEnum.M16,
  CategoryEnum.M17,
  CategoryEnum.M19,
];

const HOCKEY_AGE_RANGES: {
  min: number;
  max: number;
  category: CategoryEnum;
}[] = [
  { min: 5, max: 6, category: CategoryEnum.PRE_DECIMA },
  { min: 7, max: 8, category: CategoryEnum.DECIMA },
  { min: 9, max: 10, category: CategoryEnum.NOVENA },
  { min: 11, max: 12, category: CategoryEnum.OCTAVA },
  { min: 13, max: 14, category: CategoryEnum.SEPTIMA },
  { min: 15, max: 16, category: CategoryEnum.SEXTA },
  { min: 17, max: 19, category: CategoryEnum.QUINTA },
];

/**
 * Calculate category from birth year and sport.
 * Season year defaults to the current year.
 *
 * Rugby: M{seasonYear - birthYear}, PS if age >= 20
 * Hockey: named categories by age range, PS if age >= 20
 */
export function calculateCategory(
  birthYear: number,
  sport: SportEnum,
  seasonYear: number = new Date().getFullYear()
): CategoryEnum {
  const age = seasonYear - birthYear;

  if (age >= 20) return CategoryEnum.PLANTEL_SUPERIOR;

  if (sport === SportEnum.RUGBY) {
    const tag = `m${age}` as CategoryEnum;
    if (RUGBY_CATEGORIES.includes(tag)) return tag;
    // age 18 doesn't exist in rugby → M19
    if (age === 18) return CategoryEnum.M19;
    return CategoryEnum.PLANTEL_SUPERIOR;
  }

  // Hockey
  for (const range of HOCKEY_AGE_RANGES) {
    if (age >= range.min && age <= range.max) return range.category;
  }

  return CategoryEnum.PLANTEL_SUPERIOR;
}
