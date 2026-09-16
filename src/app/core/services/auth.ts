import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { BehaviorSubject, Observable, catchError, tap, of, throwError, shareReplay, finalize } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Router } from '@angular/router';

export interface AuthResponse {
  id: string;
  email: string;
  fullName: string;
  role: any;
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

  // 🟢 استخراج الـ Tenant ID من الـ Subdomain (مثلاً: acme.myapp.com -> acme)
  private getSubdomainTenantId(): string | null {
    const hostname = window.location.hostname;
    const parts = hostname.split('.');
    
    // إذا كان السبدومين ماشي localhost ولا admin ولا www
    if (parts.length > 2 && !parts[0].startsWith('admin') && parts[0] !== 'www') {
      return parts[0];
    }
    return null;
  }

  // 🟢 تحديث getHttpOptions لتقبل tenantId اختياري
  private getHttpOptions(tenantId?: string) {
    let headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    });

    // تحديد الـ Tenant ID: إما يدوي، ولا من Subdomain
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

  // 🟢 التعديل هنا: نزيدو tenantId كـ параметр اختياري فـ login
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
      next: () => {this.resetState()
      this.router.navigate(['']);},
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
    const user = this.currentUserSubject.value;
    if (!user) return false;
    return user.role === 'SUPER_ADMIN';
  }

  getUserRole(): string | null {
    return this.currentUserSubject.value?.role || null;
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