import { Component, Input, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { Auth } from '../../../core/services/auth';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class Sidebar {
  @Input() role: string = '';

  private authService = inject(Auth);
  get menuItems() {
    if (this.role === 'SUPER_ADMIN') {
      return [
        { label: 'Dashboard', route: '/super-admin/dashboard', icon: 'fas fa-chart-line' },
        { label: 'Tenants', route: '/super-admin/tenants', icon: 'fas fa-building' },
        { label: 'Audit Logs', route: '/super-admin/audit-logs', icon: 'fas fa-history' },
        { label: 'Admins', route: '/super-admin/admins', icon: 'fas fa-user-shield' }
      ];
    }
    return [
      { label: 'Documents', route: '/client/documents', icon: 'fas fa-file-alt' },
      { label: 'Pending', route: '/client/documents/pending', icon: 'fas fa-clock' },
      { label: 'Completed', route: '/client/documents/completed', icon: 'fas fa-check-circle' }
    ];
  }

  logout(): void {
    this.authService.logout();
    
  }
}