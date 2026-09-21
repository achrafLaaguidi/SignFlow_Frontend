// src/app/modules/client/services/role.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { RoleNameResponse, RoleResponse } from '../models/user';

export interface CreateRoleRequest {
  name: string;
  permissionIds: number[] | string[];
}

@Injectable({ providedIn: 'root' })
export class RoleService {
  private apiUrl = `${environment.apiUrl}/roles`;
  private permissionsUrl = `${environment.apiUrl}/permissions`;

  constructor(private http: HttpClient) {}

  getAllRoles(): Observable<RoleResponse[]> {
    return this.http.get<RoleResponse[]>(this.apiUrl);
  }

  getAllRolesNames(): Observable<RoleNameResponse[]> {
    return this.http.get<RoleNameResponse[]>(`${this.apiUrl}/names`);
  }

  // 🟢 الحصول على جميع الـ Permissions المتاحة فـ النظام
  getAllPermissions(): Observable<any[]> {
    return this.http.get<any[]>(this.permissionsUrl);
  }

  // 🟢 إنشاء Role جديد مع الصلاحيات
  createRole(roleData: CreateRoleRequest): Observable<RoleResponse> {
    return this.http.post<RoleResponse>(this.apiUrl, roleData);
  }

  // 🟢 تحديث Role حالي (تعديل الاسم أو الصلاحيات)
  updateRole(roleId: number | string, roleData: CreateRoleRequest): Observable<RoleResponse> {
    return this.http.put<RoleResponse>(`${this.apiUrl}/${roleId}`, roleData);
  }

  // 🟢 مسح Role
  deleteRole(roleId: number | string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${roleId}`);
  }
}