import { Component, Input, inject } from '@angular/core';

import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../../core/services/auth';

export interface MenuItem {
  label: string;
  route: string;
  icon: string;
  roles?: string[];
  permission?: string;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  @Input() userPermissions: string[] = [];

  private authService = inject(Auth);
  protected currentRole = this.authService.getUserRole() || '';
  private router = inject(Router);

  private allMenuItems: MenuItem[] = [
    // ==========================================
    // SUPER_ADMIN Routes (Checking Role ONLY)
    // ==========================================
    { 
      label: 'Dashboard', 
      route: '/super-admin/dashboard', 
      icon: 'fas fa-chart-line', 
      roles: ['SUPER_ADMIN'] 
    },
    { 
      label: 'Tenants', 
      route: '/super-admin/tenants', 
      icon: 'fas fa-building', 
      roles: ['SUPER_ADMIN']
    },
    { 
      label: 'Audit Logs', 
      route: '/super-admin/audit-logs', 
      icon: 'fas fa-history', 
      roles: ['SUPER_ADMIN']
    },
    { 
      label: 'Admins', 
      route: '/super-admin/admins', 
      icon: 'fas fa-user-shield', 
      roles: ['SUPER_ADMIN'] 
    },

    // ==========================================
    // CLIENT Routes (CLIENT_ADMIN, CLIENT_USER...)
    // Checking Role + Permissions
    // ==========================================
    { 
      label: 'Documents', 
      route: '/client/documents', 
      icon: 'fas fa-file-alt', 
      roles: ['CLIENT_ADMIN', 'CLIENT_USER'],
      permission: 'DOCUMENTS_READ'
    },
    { 
      label: 'Pending Documents', 
      route: '/client/documents/pending', 
      icon: 'fas fa-clock', 
      roles: ['CLIENT_ADMIN', 'CLIENT_USER'],
      permission: 'DOCUMENTS_READ' 
    },
    { 
      label: 'Completed Documents', 
      route: '/client/documents/completed', 
      icon: 'fas fa-check-circle', 
      roles: ['CLIENT_ADMIN', 'CLIENT_USER'],
      permission: 'DOCUMENTS_READ' 
    },
    { 
      label: 'User Management', 
      route: '/client/users', 
      icon: 'fas fa-users-cog', 
      roles: ['CLIENT_ADMIN'],
      permission: 'USER_READ' 
    }
  ];

  get menuItems(): MenuItem[] {
    
    const permissions = this.userPermissions.length > 0 
      ? this.userPermissions 
      : this.authService.getPermissions();

    return this.allMenuItems.filter(item => {
      // 1. التثبت من الـ Role
      const hasRole = !item.roles || item.roles.includes(this.currentRole);

      // 2. إيلا كان SUPER_ADMIN: كيعتمد غير على الـ Role بلا ما يشوف الـ Permissions
      if (this.currentRole === 'SUPER_ADMIN') {
        return hasRole;
      }

      // 3. بالنسبة لـ CLIENT_ADMIN, CLIENT_USER... خاص يتوفر الـ Role والـ Permission بجوج
      const hasPermission = !item.permission || permissions.includes(item.permission);
      return hasRole && hasPermission;
    });
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/auth/login']);
  }
}