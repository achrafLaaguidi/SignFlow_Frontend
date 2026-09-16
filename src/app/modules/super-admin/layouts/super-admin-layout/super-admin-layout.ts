import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Sidebar } from '../../../../shared/components/sidebar/sidebar';

@Component({
  selector: 'app-super-admin-layout',
  standalone: true,
  imports: [RouterOutlet, Sidebar],
  templateUrl: './super-admin-layout.html',
  styleUrl: './super-admin-layout.css',
})
export class SuperAdminLayout {
  role = 'SUPER_ADMIN';
}