import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PagedModel } from '../../../core/models/paged-model';

export interface PlatformMetricsResponse {
  totalTenants?: number;
  activeTenants?: number;
  totalSuperAdmins?: number;
  suspendedTenants?: number;
}

export interface AuditLogResponse {
  id: string | number;
  action: string;
  performedBy?: string;
  targetResource?: string;
  timestamp: string;
  details?: string;
  ipAddress?: string;
}

export interface PageableParams {
  page?: number;
  size?: number;
  sort?: string;
  query?: string;
}

@Injectable({
  providedIn: 'root',
})
export class Monitoring {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}central/monitoring`;

  /**
   * جلب الإحصائيات العامة للمنصة (Platform Metrics)
   * GET /api/v1/central/monitoring/metrics
   */
  getPlatformMetrics(): Observable<PlatformMetricsResponse> {
    return this.http.get<PlatformMetricsResponse>(`${this.apiUrl}/metrics`);
  }

  /**
   * جلب سجلات النظام (Audit Logs) مع الـ Pagination
   * GET /api/v1/central/monitoring/audit-logs
   */
  getAuditLogs(params?: PageableParams): Observable<PagedModel<AuditLogResponse>> {
    let httpParams = new HttpParams();

    if (params) {
      if (params.query) {
      httpParams = httpParams.set('query', params.query);
    }
      if (params.page !== undefined) {
        httpParams = httpParams.set('page', params.page.toString());
      }
      if (params.size !== undefined) {
        httpParams = httpParams.set('size', params.size.toString());
      }
      if (params.sort) {
        httpParams = httpParams.set('sort', params.sort);
      }
    }

    return this.http.get<PagedModel<AuditLogResponse>>(`${this.apiUrl}/audit-logs`, {
      params: httpParams,
    });
  }
}