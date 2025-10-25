import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { AuthService } from '../services/auth';

export const authGuard: CanActivateFn = async (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);
  return (await authService.isLoggedIn())
    ? true
    : router.createUrlTree(['/login'], { queryParams: { redirect: state.url }});
};
