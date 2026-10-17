import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZoneChangeDetection } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideToastr } from 'ngx-toastr';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { JwtInterceptorTs } from './servicios/jwt.interceptor';
import { MatPaginatorIntl } from '@angular/material/paginator';
import { SpanishPaginatorIntlTs } from './servicios/spanish-paginator-intl.ts';
import { authInterceptor } from './interceptors/auth.interceptors';


// 1. Importar PrimeNG y el tema deseado


export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideHttpClient(
      withInterceptors([JwtInterceptorTs, authInterceptor]),
    ),
    { provide: MatPaginatorIntl, useClass: SpanishPaginatorIntlTs },
    provideAnimationsAsync(), // Requerido para las transiciones de los toasts
    provideToastr({
      timeOut: 1000,
      positionClass: 'toast-center-center',
      preventDuplicates: true,
      progressBar: true,
      closeButton: true,
    }),

  ]
};
