import { PlayerPositionEnum } from '@ltrc-ps/shared-api-model';

export interface ImportPlayerRow {
  lastName: string;
  firstName: string;
  idNumber: string;
  birthDate: unknown; // Date (Excel) or string (CSV dd/MM/yyyy)
  email: string;
  position: PlayerPositionEnum;
  nickName?: string;
  alternatePosition?: PlayerPositionEnum;
  height?: number;
  weight?: number;
}
