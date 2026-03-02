import { parse, isValid } from 'date-fns';
import { DATE_FORMAT } from './constants';

/**
 * Parsea un valor desconocido a Date usando el formato dd/MM/yyyy.
 * Acepta instancias de Date directamente (ej: celdas Excel con cellDates: true).
 * Retorna null si el valor es inválido o nulo.
 */
export function parseDate(val: unknown): Date | null {
  if (!val) return null;
  if (val instanceof Date) return isValid(val) ? val : null;
  const str = String(val).trim();
  if (!str) return null;
  const parsed = parse(str, DATE_FORMAT, new Date());
  return isValid(parsed) ? parsed : null;
}
