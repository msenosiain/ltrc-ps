import { PlayerPosition } from '@ltrc-ps/shared-api-model';

export interface ImportPlayerRow {
  name: string;
  idNumber: string;
  birthDate: unknown; // Date (Excel) or string (CSV dd/MM/yyyy)
  email: string;
  position?: PlayerPosition;
  nickName?: string;
  alternatePosition?: PlayerPosition;
  height?: number;
  weight?: number;
  // talles — columna "jersey" aplica a camiseta y buzo; "short" aplica a short y pantalon
  jersey?: string;
  short?: string;
  // datos de contacto
  phone?: string;
  // datos médicos
  healthInsurance?: string;
  torgIndex?: number;
}
