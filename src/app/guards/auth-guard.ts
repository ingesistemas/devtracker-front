import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthServiceTs } from '../servicios/auth.service';


export const authGuard: CanActivateFn = (route, state) => {

  const authService = inject(AuthServiceTs);
  const router = inject(Router);

  if (authService.isLogged()) {
    return true;
  }

  router.navigate(['/ingresar']);

  return false;
};