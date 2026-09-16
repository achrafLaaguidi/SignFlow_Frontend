// src/app/modules/super-admin/services/super-admin.service.ts
import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class SuperAdmin {
  private baseUrl = `${environment.apiUrl}/central`;

  constructor(private http: HttpClient) {}

  // Tenant Management
  getTenants(query?: string, status?: string, page: number = 0, size: number = 10): Observable<any> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    if (query) params = params.set('query', query);
    if (status) params = params.set('status', status);
    
    return this.http.get(`${this.baseUrl}/tenants`, { params });
  }

  getTenantById(tenantId: string): Observable<any> {
    return this.http.get(`${this.baseUrl}/tenants/${tenantId}`);
  }

  createTenant(tenantData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/tenants`, tenantData);
  }

  updateTenantStatus(tenantId: string, status: string): Observable<any> {
    return this.http.patch(`${this.baseUrl}/tenants/${tenantId}/status`, { status });
  }

  // Monitoring
  getPlatformMetrics(): Observable<any> {
    return this.http.get(`${this.baseUrl}/monitoring/metrics`);
  }

  getAuditLogs(page: number = 0, size: number = 20): Observable<any> {
    const params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    
    return this.http.get(`${this.baseUrl}/monitoring/audit-logs`, { params });
  }

  // Admin Management
  registerSuperAdmin(adminData: any): Observable<any> {
    return this.http.post(`${this.baseUrl}/admins/register`, adminData);
  }
}