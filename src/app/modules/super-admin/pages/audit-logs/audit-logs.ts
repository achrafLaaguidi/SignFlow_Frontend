import { Component, OnInit, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSortModule, MatSort, Sort } from '@angular/material/sort';
import { AuditLogResponse, Monitoring } from '../../services/monitoring';
import { PagedModel } from '../../../../core/models/paged-model';

@Component({
  selector: 'app-audit-logs',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule
  ],
  templateUrl: './audit-logs.html',
  styleUrl: './audit-logs.css',
})
export class AuditLogs implements OnInit {
  private monitoringService = inject(Monitoring);

  displayedColumns: string[] = ['action', 'performedBy', 'targetResource', 'ipAddress', 'timestamp', 'details'];
  dataSource = new MatTableDataSource<AuditLogResponse>([]);

  totalElements = 0;
  pageSize = 10;
  pageIndex = 0;
  sortActive = 'timestamp';
  sortDirection: 'asc' | 'desc' = 'desc';
  searchQuery = '';
  isLoading = false;

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  ngOnInit(): void {
    this.loadAuditLogs();
  }

  loadAuditLogs(): void {
    this.isLoading = true;
    const sortParam = `${this.sortActive},${this.sortDirection}`;

    this.monitoringService.getAuditLogs({
      page: this.pageIndex,
      size: this.pageSize,
      sort: sortParam,
      query: this.searchQuery.trim()
    }).subscribe({
      next: (pageData: PagedModel<AuditLogResponse>) => {
        this.dataSource.data = pageData.content;
        this.totalElements = pageData.page?.totalElements??0;
        this.isLoading = false;
      },
      error: (err) => {
        console.error('Error fetching audit logs:', err);
        this.isLoading = false;
      }
    });
  }

  applyFilters(): void {
    this.pageIndex = 0; // إعادة ضبط الصفحة للأول عند البحث
    this.loadAuditLogs();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this.loadAuditLogs();
  }

  onSortChange(sortState: Sort): void {
    if (sortState.direction) {
      this.sortActive = sortState.active;
      this.sortDirection = sortState.direction as 'asc' | 'desc';
    } else {
      this.sortActive = 'timestamp';
      this.sortDirection = 'desc';
    }
    this.loadAuditLogs();
  }

  // ألوان وتصميم الـ Badges حسب نوع الـ Action
  getActionClass(action: string): string {
    if (!action) return 'bg-slate-100 text-slate-700 border-slate-200';
    const act = action.toUpperCase();
    if (act.includes('CREATE') || act.includes('REGISTER') || act.includes('LOGIN')) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200/60';
    }
    if (act.includes('UPDATE') || act.includes('EDIT')) {
      return 'bg-amber-50 text-amber-700 border-amber-200/60';
    }
    if (act.includes('DELETE') || act.includes('SUSPEND')) {
      return 'bg-rose-50 text-rose-700 border-rose-200/60';
    }
    return 'bg-indigo-50 text-indigo-700 border-indigo-200/60';
  }

  getActionDotClass(action: string): string {
    if (!action) return 'bg-slate-500';
    const act = action.toUpperCase();
    if (act.includes('CREATE') || act.includes('REGISTER') || act.includes('LOGIN')) return 'bg-emerald-500';
    if (act.includes('UPDATE') || act.includes('EDIT')) return 'bg-amber-500';
    if (act.includes('DELETE') || act.includes('SUSPEND')) return 'bg-rose-500';
    return 'bg-indigo-500';
  }
}