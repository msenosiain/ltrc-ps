import {
  ApplicationConfig,
  InjectionToken,
  LOCALE_ID,
  Provider,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { routes } from './app.routes';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { registerLocaleData } from '@angular/common';
import localeEsAr from '@angular/common/locales/es-AR';
import { MAT_DATE_LOCALE } from '@angular/material/core';
import { provideDateFnsAdapter } from '@angular/material-date-fns-adapter';
import { es } from 'date-fns/locale';
import { authInterceptor } from './auth/auth.interceptor';

export interface ApiConfig {
  baseUrl: string;
}

export const API_CONFIG: ApiConfig = {
  baseUrl: 'http://localhost:3000/api/v1',
};
export const API_CONFIG_TOKEN = new InjectionToken<ApiConfig>(
  'API_CONFIG_TOKEN'
);

const apiConfigProvider: Provider = {
  provide: API_CONFIG_TOKEN,
  useValue: API_CONFIG,
};

// Registrar los datos específicos para Argentina
registerLocaleData(localeEsAr);

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    apiConfigProvider,
    { provide: LOCALE_ID, useValue: 'es-AR' },
    { provide: MAT_DATE_LOCALE, useValue: es },
    provideDateFnsAdapter({
      parse: { dateInput: 'dd/MM/yyyy' },
      display: {
        dateInput: 'dd/MM/yyyy',
        monthYearLabel: 'MMM yyyy',
        dateA11yLabel: 'dd/MM/yyyy',
        monthYearA11yLabel: 'MMMM yyyy',
      },
    }),
  ],
};
