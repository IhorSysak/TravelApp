import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from './auth-service';
import { UserRole } from '../../models/auth.model';
import { ToastService } from '../toast/toast-service';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const authService = inject(AuthService);
  const toastService = inject(ToastService);

  if (authService.isAuthenticated()) {
    const roles = route.data['roles'] as UserRole[] | undefined;
    const currentUser = authService.currentUser();
    if (roles && currentUser && !roles.includes(currentUser.role)) {
      router.navigate(['/forbidden']);
      toastService.error('You do not have permission to access this page.');
    }

    return true;
  }

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  toastService.error('You must be logged in to access this page.');
  return false;
}

export const notAuthGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);

  if(authService.isAuthenticated()) {
    authService.redirectBasedOnRole();
    return false;
  }

  return true;
}
