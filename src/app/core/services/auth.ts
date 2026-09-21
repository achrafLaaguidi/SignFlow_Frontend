import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, of, throwError, shareReplay } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';
import { RoleResponse } from '../../modules/client/models/user';



export interface AuthResponse {
  id: string;
  email: string;
  fullName: string;
  role: RoleResponse | string; 
  tenantId?: string;
}

export interface AuthRequest {
  email: string;
  password: string;
}

@Injectable({ providedIn: 'root' })
export class Auth {
  private currentUserSubject = new BehaviorSubject<AuthResponse | null>(null);
  currentUser$ = this.currentUserSubject.asObservable();

  private checkSession$?: Observable<AuthResponse | null>;
  private router = inject(Router);

  private getSubdomainTenantId(): string | null {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    if (parts.length > 2 && !parts[0].startsWith('admin') && parts[0] !== 'www') {
      return parts[0];
    }
    return null;
  }

  private getHttpOptions(tenantId?: string) {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    const resolvedTenantId = tenantId || this.getSubdomainTenantId();

    if (resolvedTenantId) {
      headers = headers.set('X-Tenant-ID', resolvedTenantId);
    }

    return {
      withCredentials: true,
      headers: headers
    };
  }

  constructor(private http: HttpClient) {}

  setUserSession(user: AuthResponse): void {
    this.currentUserSubject.next(user);
    this.checkSession$ = of(user);
  }

  checkSession(): Observable<AuthResponse | null> {
    if (this.currentUserSubject.value) {
      return of(this.currentUserSubject.value);
    }

    const isCentralPath = this.isCentralRoute();
    const meEndpoint = isCentralPath 
      ? `${environment.apiUrl}/central/auth/me` 
      : `${environment.apiUrl}/auth/me`;

    if (!this.checkSession$) {
      this.checkSession$ = this.http.get<AuthResponse>(meEndpoint, this.getHttpOptions()).pipe(
        tap(user => this.currentUserSubject.next(user)),
        catchError(() => {
          this.currentUserSubject.next(null);
          return of(null);
        }),
        shareReplay(1)
      );
    }

    return this.checkSession$;
  }

  login(credentials: AuthRequest, tenantId?: string): Observable<AuthResponse> {
    const isCentralPath = this.isCentralRoute();
    
    const loginEndpoint = isCentralPath 
      ? `${environment.apiUrl}/central/auth/login` 
      : `${environment.apiUrl}/auth/login`;

    return this.http.post<AuthResponse>(loginEndpoint, credentials, this.getHttpOptions(tenantId)).pipe(
      tap(user => this.setUserSession(user)),
      catchError((error) => {
        if (!isCentralPath && error.status === 401) {
          return this.http.post<AuthResponse>(
            `${environment.apiUrl}/central/auth/login`, 
            credentials, 
            this.getHttpOptions(tenantId)
          ).pipe(
            tap(user => this.setUserSession(user)),
            catchError((centralError) => throwError(() => centralError))
          );
        }
        return throwError(() => error);
      })
    );
  }

  refreshToken(): Observable<void> {
    const isCentralPath = this.isCentralRoute() || this.isSuperAdmin();

    const refreshEndpoint = isCentralPath
      ? `${environment.apiUrl}/central/auth/refresh`
      : `${environment.apiUrl}/auth/refresh`;

    return this.http.post<void>(refreshEndpoint, {}, this.getHttpOptions()).pipe(
      catchError((error) => {
        this.resetState();
        return throwError(() => error);
      })
    );
  }

  logout(): void {
    const logoutEndpoint = `${environment.apiUrl}/auth/logout`;

    this.http.post(logoutEndpoint, {}, this.getHttpOptions()).subscribe({
      next: () => {
        this.resetState();
        this.router.navigate(['']);
      },
      error: () => this.resetState()
    });
  }

  private isCentralRoute(): boolean {
    const isPathCentral = window.location.pathname.startsWith('/super-admin');
    const isSubdomainCentral = window.location.hostname.startsWith('admin.');
    return isPathCentral || isSubdomainCentral;
  }

  getCurrentUser(): AuthResponse | null {
    return this.currentUserSubject.value;
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  isSuperAdmin(): boolean {
    return this.getUserRole() === 'SUPER_ADMIN';
  }

  getUserRole(): string | null {
    const user = this.currentUserSubject.value;
    if (!user) return null;

    if (typeof user.role === 'object') {
      return user.role?.name || null;
    }
    return user.role;
  }

  // 🟢 استخراج الـ Permissions حنصياً من داخل الـ Role Object
  getPermissions(): string[] {
    const user = this.currentUserSubject.value;
    if (!user || !user.role || typeof user.role !== 'object') {
      return [];
    }

    const rawPermissions = user.role.permissions;
    if (!Array.isArray(rawPermissions)) {
      return [];
    }

    // التعامل مع الحالة فاش كتكون الـ permission عبارة عن Object { name: '...' } أو String ديريكت
    return rawPermissions.map(p => typeof p === 'string' ? p : p.name);
  }

  hasPermission(permission: string): boolean {
    if (this.isSuperAdmin()) return true;
    return this.getPermissions().includes(permission);
  }

  getTenantId(): string | null {
    return this.currentUserSubject.value?.tenantId || null;
  }

  clearSession(): void {
    this.resetState();
  }

  private resetState(): void {
    this.currentUserSubject.next(null);
    this.checkSession$ = undefined;
  }
}