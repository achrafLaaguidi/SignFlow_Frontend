import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { map, take } from 'rxjs/operators';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);
  const expectedRoles = route.data['roles'] as Array<string>;

  return authService.checkSession().pipe(
    take(1),
    map(user => {
      if (!user) {
        return router.createUrlTree(['/auth/login'], {
          queryParams: { returnUrl: state.url }
        });
      }

      const userRoleName = extractRoleName(user.role);

      const hasRole = expectedRoles.some(
        role => role.toUpperCase() === userRoleName
      );

      if (hasRole) {
        return true;
      }

      if (userRoleName === 'SUPER_ADMIN') {
        return router.createUrlTree(['/super-admin/dashboard']);
      } else {
        return router.createUrlTree(['/client/documents']);
      }
    })
  );
};

/**
 * Helper function لاستخراج اسم الـ Role بأمان
 */
function extractRoleName(role: any): string {
  if (!role) return '';

  if (typeof role === 'string') {
    return role.toUpperCase();
  }

  if (typeof role === 'object' && role.name) {
    return String(role.name).toUpperCase();
  }

  return '';
}