import { Component, OnInit, ViewChild, AfterViewInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';

import { TenantManagement } from '../../../services/tenant-management';
import { CreateTenant, CreateTenantRequest } from '../create-tenant/create-tenant';

@Component({
  selector: 'app-tenant-list',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    CreateTenant,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './tenant-list.html'
})
export class TenantList implements OnInit, AfterViewInit {
  displayedColumns: string[] = ['companyName', 'adminEmail', 'status', 'createdAt', 'actions'];
  dataSource = new MatTableDataSource<any>([]);

  // 📊 متغيرات Server-Side Pagination & Sorting
  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  sortActive = 'createdAt';
  sortDirection = 'desc';

  searchQuery = '';
  statusFilter = '';
  showModal = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  apiErrors: { [key: string]: string } = {};
  errorMessage: string | null = null;

  private tenantService = inject(TenantManagement);
  private router = inject(Router);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    this.loadTenants();
  }

  ngAfterViewInit(): void {
    // 🔄 مراقبة تغيير الترتيب (Sort Event)
    this.sort.sortChange.subscribe((sortState: Sort) => {
      this.pageIndex = 0;
      this.sortActive = sortState.active;
      this.sortDirection = sortState.direction || 'desc';
      
      if (this.paginator) {
        this.paginator.pageIndex = 0;
      }
      this.loadTenants();
    });
  }

  loadTenants(): void {
    this.tenantService.getTenants(
      this.searchQuery,
      this.statusFilter,
      this.pageIndex,
      this.pageSize,
      this.sortActive,
      this.sortDirection
    ).subscribe({
      next: (response: any) => {
        this.dataSource.data = response.content || [];
        
        // 🟢 تحديث مجموع العناصر من PagedModel
        if (response.page) {
          this.totalElements = response.page.totalElements;
        } else if (response.totalElements !== undefined) {
          this.totalElements = response.totalElements;
        }
      },
      error: () => {
        this.toastr.error('Failed to load tenants list. Please try again.', 'Error');
      }
    });
  }

  // 🔄 عند تغيير الصفحة أو عدد العناصر فـ Paginator
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadTenants();
  }

  applyFilters(): void {
    this.pageIndex = 0;
    if (this.paginator) {
      this.paginator.pageIndex = 0;
    }
    this.loadTenants();
  }

  handleCreateTenant(newTenant: CreateTenantRequest): void {
    this.tenantService.createTenant(newTenant).subscribe({
      next: () => {
        this.toastr.success('Tenant created successfully', 'Success');
        this.showModal = false;
        this.loadTenants(); // إعادة تحميل القائمة من Backend
      },
      error: (err: any) => {
        if (err.error && err.error.errors) {
          this.apiErrors = err.error.errors;
        } else if (err.error && err.error.message) {
          this.errorMessage = err.error.message;
        } else {
          this.toastr.error('Failed to create tenant. Please try again.', 'Error');
        }
      }
    });
  }

  viewTenant(tenantId: string): void {
    this.router.navigate([`/super-admin/tenants/${tenantId}`]);
  }

  toggleStatus(tenant: any): void {
    const newStatus = tenant.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    this.tenantService.updateTenantStatus(tenant.tenantId, newStatus).subscribe({
      next: () => {
        this.toastr.success(`Tenant status updated to ${newStatus}`, 'Success');
        this.loadTenants();
      },
      error: () => {
        this.toastr.error('Failed to update tenant status.', 'Error');
      }
    });
  }

  deleteTenant(tenant: any): void {
    if (confirm(`Are you sure you want to delete ${tenant.companyName}?`)) {
      this.tenantService.deleteTenant(tenant.tenantId).subscribe({
        next: () => {
          this.toastr.success('Tenant deleted successfully', 'Success');
          this.loadTenants();
        },
        error: () => {
          this.toastr.error('Failed to delete tenant.', 'Error');
        }
      });
    }
  }

  getStatusClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-emerald-50 text-emerald-700 border border-emerald-200/60';
      case 'SUSPENDED':
        return 'bg-amber-50 text-amber-700 border border-amber-200/60';
      case 'INACTIVE':
        return 'bg-rose-50 text-rose-700 border border-rose-200/60';
      default:
        return 'bg-slate-100 text-slate-700 border border-slate-200/60';
    }
  }

  getStatusDotClass(status: string): string {
    switch (status?.toUpperCase()) {
      case 'ACTIVE':
        return 'bg-emerald-500';
      case 'SUSPENDED':
        return 'bg-amber-500';
      case 'INACTIVE':
        return 'bg-rose-500';
      default:
        return 'bg-slate-400';
    }
  }
}