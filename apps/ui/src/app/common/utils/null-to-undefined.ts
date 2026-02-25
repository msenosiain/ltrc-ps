/**
 * Convierte recursivamente todos los valores null a undefined en un objeto.
 * Util para adaptar valores de ReactiveForm (que usan null) a tipos del dominio
 * (que usan undefined para campos opcionales).
 *
 * @example
 * const formValue = { name: 'Juan', nickname: null, address: { city: null } };
 * nullToUndefined(formValue);
 * // { name: 'Juan', nickname: undefined, address: { city: undefined } }
 */
export type NullToUndefined<T> = T extends null
  ? undefined
  : T extends object
  ? { [K in keyof T]: NullToUndefined<T[K]> }
  : T;

export function nullToUndefined<T>(value: T): NullToUndefined<T> {
  if (value === null) return undefined as NullToUndefined<T>;

  if (Array.isArray(value)) {
    return value.map(nullToUndefined) as NullToUndefined<T>;
  }

  if (typeof value === 'object') {
    return Object.fromEntries(
      Object.entries(value).map(([k, v]) => [k, nullToUndefined(v)])
    ) as NullToUndefined<T>;
  }

  return value as NullToUndefined<T>;
}
