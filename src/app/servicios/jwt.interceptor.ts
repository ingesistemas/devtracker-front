import { HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { AuthServiceTs } from './auth.service';


export const JwtInterceptorTs: HttpInterceptorFn = (req, next) => {

  const authService = inject(AuthServiceTs);
  const token = authService.getToken();

  if (token) {
    req = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  return next(req);
};

