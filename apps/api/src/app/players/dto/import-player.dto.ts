import { PlayerPosition } from '@ltrc-campo/shared-api-model';

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

/** Row shape from the padrón Excel (column headers as-is) */
export interface PadronRow {
  Socio?: number;
  Nombre: string;
  'N° Doc.': string | number;
  'Fecha Nac.': unknown;
  'Categoría'?: string;
  'Nombre Jefe'?: string;
  Email?: string;
}

/** Row shape from the survey Excel (Google Forms responses) */
export interface SurveyRow {
  'Marca temporal'?: unknown;
  Nombre: string;
  Apellido: string;
  DNI: string | number;
  'Fecha de nacimiento'?: unknown;
  'Correo Electrónico'?: string;
  Telefono?: string | number;
  'Obra Social'?: string;
  'Talle Camiseta'?: string;
  'Talle Short/Falda'?: string;
  Deporte?: string;
  'División Hockey'?: string;
  'División Rugby'?: string;
}
