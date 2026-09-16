import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { PagedModel } from '../../../core/models/paged-model';

@Injectable({
  providedIn: 'root',
})
export class TenantManagement {
  private http = inject(HttpClient);
  
  private apiUrl = `${environment.apiUrl}/central/tenants`;

 getTenants(
    searchQuery: string = '',
    status: string = '',
    page: number = 0,
    size: number = 10,
    sortActive: string = 'createdAt',
    sortDirection: string = 'desc'
  ): Observable<PagedModel<any>> {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());

    if (searchQuery) {
      params = params.set('search', searchQuery);
    }
    if (status) {
      params = params.set('status', status);
    }

    if (sortActive && sortDirection) {
      params = params.set('sort', `${sortActive},${sortDirection}`);
    }

    return this.http.get<PagedModel<any>>(this.apiUrl, { params });
  }

  getTenantById(tenantId: string): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/${tenantId}`);
  }

  createTenant(tenantData: any): Observable<any> {
    return this.http.post<any>(this.apiUrl, tenantData);
  }

  updateTenantStatus(tenantId: string, status: string): Observable<any> {
    return this.http.patch<any>(`${this.apiUrl}/${tenantId}/status`, { status });
  }

  deleteTenant(tenantId: string): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${tenantId}`);
  }
}