import { Component, OnInit, inject } from '@angular/core';

import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Auth, AuthRequest } from '../../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    RouterLink
],
  templateUrl: './login.html'
})
export class Login implements OnInit {
  loginForm!: FormGroup;
  isLoading = false;
  isCheckingSession = true;
  showPassword = false;
  errorMessage = '';
  returnUrl = '';

  private fb = inject(FormBuilder);
  private authService = inject(Auth);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private toastr = inject(ToastrService);

  ngOnInit(): void {
    // 🟢 قراءة returnUrl من Query Parameters
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '';
    
    this.initForm();
    this.checkInitialSession();
  }

  private checkInitialSession(): void {
    if (this.authService.isAuthenticated()) {
      this.redirectBasedOnRole(this.authService.getUserRole());
      return;
    }

    this.authService.checkSession().subscribe({
      next: (user) => {
        this.isCheckingSession = false;
        if (user) {
          // استخراج اسم الـ Role حتى لو جا كـ Object
          const roleName = typeof user.role === 'object' ? user.role?.name : user.role;
          this.redirectBasedOnRole(roleName);
        }
      },
      error: () => {
        this.isCheckingSession = false;
      }
    });
  }

  initForm(): void {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required]],
      rememberMe: [false]
    });
  }

  onSubmit(): void {
    if (this.loginForm.invalid || this.isLoading) {
      this.loginForm.markAllAsTouched();
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const authRequest: AuthRequest = this.loginForm.value;

    this.authService.login(authRequest).subscribe({
      next: (user) => {
        this.isLoading = false;
        this.toastr.success('Welcome back!', 'Login Successful');
        
        // استخراج اسم الـ Role دقيق
        const roleName = typeof user.role === 'object' ? user.role?.name : user.role;
        this.redirectBasedOnRole(roleName);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Login failed. Please check your credentials.';
        this.toastr.error(this.errorMessage);
      }
    });
  }

  redirectBasedOnRole(role?: string | null): void {
    // 🟢 إلا كان كاين returnUrl، يمشي ليه ديريكت
    if (this.returnUrl) {
      this.router.navigateByUrl(this.returnUrl);
      return;
    }

    // 🟢 وإلا كيمشي للـ Route الافتراضي حسب الـ Role
    const userRole = role || this.authService.getUserRole();
    
    if (userRole === 'SUPER_ADMIN') {
      this.router.navigate(['/super-admin/dashboard']);
    } else {
      // موجه لجميع أدوار الـ Client (CLIENT_ADMIN, CLIENT_USER...)
      this.router.navigate(['/client/documents']);
    }
  }

  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  get email() { return this.loginForm.get('email'); }
  get password() { return this.loginForm.get('password'); }
}