import { HttpInterceptorFn, HttpRequest, HttpHandlerFn, HttpErrorResponse, HttpClient } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError } from 'rxjs';
import { AuthServiceTs } from '../servicios/auth.service';


export const authInterceptor: HttpInterceptorFn = (req: HttpRequest<unknown>, next: HttpHandlerFn) => {
  const authService = inject(AuthServiceTs);
  const http = inject(HttpClient);
  
  // 1. Obtener el token usando TU servicio
  const token = authService.getToken();

  let authReq = req;
  if (token) {
    authReq = req.clone({
      headers: req.headers.set('Authorization', `Bearer ${token}`)
    });
  }

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {

      // 2. Si da 401 en peticiones normales, refrescar token
      if (error.status === 401 && !req.url.includes('/ingresar') && !req.url.includes('/auth/refresh')) {
        
        //return http.post<any>('https://tu-api.com/api/auth/refresh', {}).pipe(
        return http.post<any>('http://localhost:4200/api/auth/refresh', {}).pipe(
          switchMap((res) => {
            
            // 3. Guardar el nuevo token usando TU servicio
            authService.setToken(res.token);

            // 4. Reintentar petición con el nuevo token
            const nuevaPeticion = req.clone({
              headers: req.headers.set('Authorization', `Bearer ${res.token}`)
            });

            return next(nuevaPeticion);
          }),
          catchError((errRefresh) => {
            // 5. Si falla el refresh, cerrar sesión con TU servicio
            authService.logout();
            window.location.href = '/login';
            return throwError(() => errRefresh);
          })
        );
      }

      return throwError(() => error);
    })
  );
};