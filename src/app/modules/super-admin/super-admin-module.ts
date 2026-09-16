import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

// Layout & Components
import { SuperAdminLayout } from './layouts/super-admin-layout/super-admin-layout';
import { Dashboard } from './pages/dashboard/dashboard';
import { TenantList } from './pages/tenant-management/tenant-list/tenant-list';
import { CreateTenant } from './pages/tenant-management/create-tenant/create-tenant';
import { TenantDetail } from './pages/tenant-management/tenant-detail/tenant-detail';
import { AuditLogs } from './pages/audit-logs/audit-logs';
import { AdminManagement } from './pages/admin-management/admin-management';

const routes: Routes = [
  {
    path: '',
    component: SuperAdminLayout,
    children: [
      { path: 'dashboard', component: Dashboard },
      { path: 'tenants', component: TenantList },
      { path: 'tenants/create', component: CreateTenant },
      { path: 'tenants/:tenantId', component: TenantDetail },
      { path: 'audit-logs', component: AuditLogs },
      { path: 'admins', component: AdminManagement },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' }
    ]
  }
];

@NgModule({
  imports: [
    RouterModule.forChild(routes),
    SuperAdminLayout,
    Dashboard,
    TenantList,
    CreateTenant,
    TenantDetail,
    AuditLogs,
    AdminManagement
  ]
})
export class SuperAdminModule { }