import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard'; 
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  { 
    path: 'auth',
    loadChildren: () => import('./modules/auth/auth-module').then(m => m.AuthModule) 
  },
  { 
    path: 'super-admin', 
    loadChildren: () => import('./modules/super-admin/super-admin-module').then(m => m.SuperAdminModule),
    canActivate: [roleGuard],
    data: { roles: ['SUPER_ADMIN'] }
  },
  { 
    path: 'client', 
    loadChildren: () => import('./modules/client/client-module').then(m => m.ClientModule),
    canActivate: [roleGuard],
    data: { roles: ['TENANT_ADMIN', 'USER'] }
  },
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/auth/login' }
];