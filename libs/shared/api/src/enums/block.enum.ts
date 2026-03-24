import { CategoryEnum } from './category.enum';

export enum BlockEnum {
  INFANTILES = 'infantiles',
  CADETES = 'cadetes',
  JUVENILES = 'juveniles',
  PLANTEL_SUPERIOR = 'plantel_superior',
}

const BLOCK_CATEGORIES: Record<BlockEnum, CategoryEnum[]> = {
  [BlockEnum.INFANTILES]: [
    CategoryEnum.M5,
    CategoryEnum.M6,
    CategoryEnum.M7,
    CategoryEnum.M8,
    CategoryEnum.M9,
    CategoryEnum.M10,
    CategoryEnum.M11,
    CategoryEnum.M12,
    CategoryEnum.PRE_DECIMA,
    CategoryEnum.DECIMA,
    CategoryEnum.NOVENA,
  ],
  [BlockEnum.CADETES]: [
    CategoryEnum.M13,
    CategoryEnum.M14,
    CategoryEnum.OCTAVA,
    CategoryEnum.SEPTIMA,
  ],
  [BlockEnum.JUVENILES]: [
    CategoryEnum.M15,
    CategoryEnum.M16,
    CategoryEnum.M17,
    CategoryEnum.M19,
    CategoryEnum.SEXTA,
    CategoryEnum.QUINTA,
    CategoryEnum.CUARTA,
  ],
  [BlockEnum.PLANTEL_SUPERIOR]: [
    CategoryEnum.PLANTEL_SUPERIOR,
  ],
};

const CATEGORY_TO_BLOCK = new Map<CategoryEnum, BlockEnum>(
  (Object.entries(BLOCK_CATEGORIES) as [BlockEnum, CategoryEnum[]][]).flatMap(
    ([block, cats]) => cats.map((cat) => [cat, block])
  )
);

export function getCategoryBlock(category: CategoryEnum): BlockEnum | undefined {
  return CATEGORY_TO_BLOCK.get(category);
}

export function getBlockCategories(block: BlockEnum): CategoryEnum[] {
  return BLOCK_CATEGORIES[block];
}
