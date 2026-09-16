import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';

export interface CreateTenantRequest {
  companyName: string;
  dbSchema: string;
  adminFullName: string;
  adminEmail: string;
  adminPassword?: string;
}

@Component({
  selector: 'app-create-tenant',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './create-tenant.html'
})
export class CreateTenant {
  @Input() errorMessage: string | null = null;
  @Input() apiErrors: { [key: string]: string } = {};

  @Output() closeEvent = new EventEmitter<void>();
  @Output() saveEvent = new EventEmitter<CreateTenantRequest>();

  tenantForm: FormGroup;

  constructor(private fb: FormBuilder) {
    this.tenantForm = this.fb.group({
      companyName: ['', Validators.required],
      dbSchema: ['', Validators.required],
      adminFullName: ['', Validators.required],
      adminEmail: ['', [Validators.required, Validators.email]],
      adminPassword: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.tenantForm.valid) {
      this.saveEvent.emit(this.tenantForm.value);
    } else {
      this.tenantForm.markAllAsTouched();
    }
  }

  close() {
    this.closeEvent.emit();
  }
}