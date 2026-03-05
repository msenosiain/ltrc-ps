import { HttpErrorResponse } from '@angular/common/http';

export function getErrorMessage(
  err: unknown,
  fallback = 'Ocurrió un error inesperado'
): string {
  if (err instanceof HttpErrorResponse) {
    const body = err.error;
    if (typeof body?.message === 'string') return body.message;
    if (Array.isArray(body?.message)) return body.message.join(', ');
  }
  return fallback;
}
