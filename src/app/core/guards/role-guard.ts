import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { map, take } from 'rxjs/operators';

export const roleGuard: CanActivateFn = (route, state) => {
  const authService = inject(Auth);
  const router = inject(Router);
  const expectedRoles = (route.data['roles'] as Array<string>) || [];

  return authService.checkSession().pipe(
    take(1),
    map(user => {
      if (!user) {
        return router.createUrlTree(['/auth/login'], {
          queryParams: { returnUrl: state.url }
        });
      }

      const userRoleName = extractRoleName(user.role);

      // SUPER_ADMIN عنده وصول كامل لجميع المسارات
      if (userRoleName === 'SUPER_ADMIN') {
        return true;
      }

      const hasRole = expectedRoles.some(
        role => role.toUpperCase() === userRoleName
      );

      if (hasRole) {
        return true;
      }

      // توجيه المستخدم حسب دوره فـ حالة عدم التوفر على الصلاحية
      return userRoleName === 'SUPER_ADMIN'
        ? router.createUrlTree(['/super-admin/dashboard'])
        : router.createUrlTree(['/client/documents']);
    })
  );
};

function extractRoleName(role: any): string {
  if (!role) return '';
  if (typeof role === 'string') return role.toUpperCase();
  if (typeof role === 'object' && role.name) return String(role.name).toUpperCase();
  return '';
}