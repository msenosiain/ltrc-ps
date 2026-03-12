import { HockeyBranchEnum } from '@ltrc-ps/shared-api-model';

export interface BranchOption {
  id: HockeyBranchEnum;
  label: string;
}

export const branchOptions: BranchOption[] = [
  { id: HockeyBranchEnum.A, label: 'Rama A' },
  { id: HockeyBranchEnum.B, label: 'Rama B' },
  { id: HockeyBranchEnum.C, label: 'Rama C' },
  { id: HockeyBranchEnum.D, label: 'Rama D' },
  { id: HockeyBranchEnum.E, label: 'Rama E' },
];

export function getBranchLabel(id?: HockeyBranchEnum | null): string {
  if (!id) return '';
  return branchOptions.find((b) => b.id === id)?.label ?? id;
}
