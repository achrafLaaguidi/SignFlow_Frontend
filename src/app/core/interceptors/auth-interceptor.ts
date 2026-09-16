import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, switchMap, throwError, BehaviorSubject, filter, take } from 'rxjs';
import { Auth } from '../services/auth';

let isRefreshing = false;
// استعملنا boolean | null باش نعرفو واش النجاح (true) ولا الفشل (false)
const refreshTokenSubject = new BehaviorSubject<boolean | null>(null);

export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const authService = inject(Auth);

  const isAuthRequest = req.url.includes('/auth/login') || 
                        req.url.includes('/auth/refresh') ||
                        req.url.includes('/auth/logout') ||
                        req.url.includes('/central/auth/login') ||
                        req.url.includes('/central/auth/refresh') ||
                        req.url.includes('/central/auth/logout');

  const authReq = req.clone({
    withCredentials: true
  });

  return next(authReq).pipe(
    catchError((error: HttpErrorResponse) => {
      
      // 🟢 1. إذا كان الخطأ 401 وجاي من طلب الـ Refresh نفسه، خروج فوري
      if (error.status === 401 && req.url.includes('/auth/refresh')) {
        authService.logout();
        return throwError(() => error);
      }

      // 🟢 2. إذا كان الخطأ 401 من طلب عادي (مش ماشي Auth Request)
      if (error.status === 401 && !isAuthRequest) {
        
        if (!isRefreshing) {
          isRefreshing = true;
          refreshTokenSubject.next(null);

          return authService.refreshToken().pipe(
            switchMap(() => {
              isRefreshing = false;
              refreshTokenSubject.next(true); // نجاح التجديد
              return next(authReq);
            }),
            catchError((refreshError) => {
              isRefreshing = false;
              refreshTokenSubject.next(false); // فشل التجديد
              
              // 🚨 خروج المستخدم
              authService.logout();
              
              return throwError(() => refreshError);
            })
          );
        } else {
          // 🟢 3. انتظار نتيجة طلب الـ Refresh الحالي
          return refreshTokenSubject.pipe(
            filter(result => result !== null),
            take(1),
            switchMap((success) => {
              if (success) {
                return next(authReq);
              } else {
                // إذا فشل الـ Refresh للطلب الأولي، هاد الطلبات حتى هما كيرجعو Error
                return throwError(() => error);
              }
            })
          );
        }
      }

      return throwError(() => error);
    })
  );
};