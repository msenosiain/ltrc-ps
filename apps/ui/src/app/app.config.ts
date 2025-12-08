import {
  ApplicationConfig,
  InjectionToken,
  Provider,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { appRoutes } from './app.routes';
import { provideHttpClient, withFetch } from '@angular/common/http';

export interface ApiConfig {
  baseUrl: string;
}

export const API_CONFIG: ApiConfig = {
  baseUrl: 'http://localhost:3000/api',
};
export const API_CONFIG_TOKEN = new InjectionToken<ApiConfig>(
  'API_CONFIG_TOKEN'
);

const apiConfigProvider: Provider = {
  provide: API_CONFIG_TOKEN,
  useValue: API_CONFIG,
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    provideHttpClient(withFetch()),
    apiConfigProvider
  ],
};
