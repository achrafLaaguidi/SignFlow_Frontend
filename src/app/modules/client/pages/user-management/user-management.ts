// src/app/modules/client/pages/user-management/user-management.ts
import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { UserService } from '../../services/user-service';
import { RoleService } from '../../services/role-service';
import { UserResponse, RoleResponse, RoleNameResponse } from '../../models/user';
import { ToastrService } from 'ngx-toastr';

// Angular Material
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { Confirmation } from '../../../../shared/components/confirmation/confirmation';


export interface PermissionGroup {
  category: string;
  permissions: any[];
}

@Component({
  selector: 'app-user-management',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    Confirmation
],
  templateUrl: './user-management.html'
})
export class UserManagement implements OnInit {
  users: UserResponse[] = [];
  roles: RoleResponse[] = [];
  rolesNames: RoleNameResponse[] = [];
  userForm!: FormGroup;
  roleForm!: FormGroup;

  // Material Table Config
  displayedColumns: string[] = ['fullName', 'phone', 'role', 'actions'];
  dataSource = new MatTableDataSource<UserResponse>([]);
  sortActive = 'fullName';

  // User Modal State
  isModalOpen = false;
  isEditMode = false;
  selectedUserId: string | null = null;
  isLoading = false;

  // Confirmation Delete Modal State
  isConfirmModalOpen = false;
  userToDeleteId: string | null = null;

  // Role Modal State
  isRoleModalOpen = false;
  isEditRoleMode = false;
  selectedRoleId: number | string | null = null;
  availablePermissions: any[] = [];
  groupedPermissions: PermissionGroup[] = [];
  selectedPermissionIds: Set<any> = new Set();

  // Pagination Props
  currentPage = 0;
  pageIndex = 0;
  pageSize = 10;
  totalPages = 0;
  totalElements = 0;

  constructor(
    private userService: UserService,
    private roleService: RoleService,
    private fb: FormBuilder,
    private toastr: ToastrService,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit(): void {
    this.initForms();
    this.loadUsers(this.currentPage, this.pageSize);
    this.loadRoles();
    this.loadPermissions();
  }

  initForms(): void {
    this.userForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      fullName: ['', [Validators.required]],
      phone: [''],
      roleId: ['', [Validators.required]]
    });

    this.roleForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]]
    });
  }

  // ==========================================
  // 👥 USER MANAGEMENT LOGIC
  // ==========================================

  loadUsers(page: number = 0, size: number = this.pageSize): void {
    this.isLoading = true;
    this.userService.getAllUsers(page, size).subscribe({
      next: (data) => {
        this.users = [...data.content];
        this.dataSource.data = this.users;
        
        this.currentPage = data.number;
        this.pageIndex = data.number;
        this.pageSize = data.size;
        this.totalPages = data.totalPages;
        this.totalElements = data.totalElements;
        this.isLoading = false;
        this.cdr.detectChanges();
      },
      error: () => {
        this.toastr.error('Failed to load users');
        this.isLoading = false;
      }
    });
  }

  onPageChange(event: PageEvent): void {
    this.pageSize = event.pageSize;
    this.pageIndex = event.pageIndex;
    this.loadUsers(event.pageIndex, event.pageSize);
  }

  openCreateModal(): void {
    this.isEditMode = false;
    this.selectedUserId = null;
    this.userForm.reset({ roleId: '' });
    
    this.userForm.get('password')?.setValidators([Validators.required, Validators.minLength(6)]);
    this.userForm.get('email')?.enable();
    this.userForm.get('password')?.updateValueAndValidity();
    
    this.isModalOpen = true;
  }

  openEditModal(user: UserResponse): void {
    this.isEditMode = true;
    this.selectedUserId = user.id;

    this.userForm.patchValue({
      email: user.email,
      fullName: user.fullName,
      phone: user.phone || '',
      roleId: user.role?.id || ''
    });

    this.userForm.get('email')?.disable();
    this.userForm.get('password')?.clearValidators();
    this.userForm.get('password')?.updateValueAndValidity();

    this.isModalOpen = true;
  }

  closeModal(): void {
    this.isModalOpen = false;
  }

  onSubmit(): void {
    if (this.userForm.invalid) {
      this.userForm.markAllAsTouched();
      return;
    }

    if (this.isEditMode && this.selectedUserId) {
      const updateData = {
        fullName: this.userForm.value.fullName,
        phone: this.userForm.value.phone,
        roleId: this.userForm.value.roleId
      };

      this.userService.updateUser(this.selectedUserId, updateData).subscribe({
        next: () => {
          this.toastr.success('User updated successfully');
          this.closeModal();
          this.loadUsers(this.currentPage, this.pageSize);
        },
        error: (err) => this.toastr.error(err.error?.message || 'Error updating user')
      });

    } else {
      this.userService.createUser(this.userForm.getRawValue()).subscribe({
        next: () => {
          this.toastr.success('User created successfully');
          this.closeModal();
          this.loadUsers(this.currentPage, this.pageSize);
        },
        error: (err) => this.toastr.error(err.error?.message || 'Error creating user')
      });
    }
  }

  // --- Delete Modal Logic ---

  openDeleteModal(id: string): void {
    this.userToDeleteId = id;
    this.isConfirmModalOpen = true;
  }

  closeDeleteModal(): void {
    this.userToDeleteId = null;
    this.isConfirmModalOpen = false;
  }

  confirmDeleteUser(): void {
    if (!this.userToDeleteId) return;

    this.userService.deleteUser(this.userToDeleteId).subscribe({
      next: () => {
        this.toastr.success('User deleted successfully');
        this.closeDeleteModal();
        this.loadUsers(this.currentPage, this.pageSize);
      },
      error: () => {
        this.toastr.error('Failed to delete user');
        this.closeDeleteModal();
      }
    });
  }

  // ==========================================
  // 🛡️ ROLE & PERMISSION MANAGEMENT LOGIC
  // ==========================================

  loadRoles(): void {
    this.roleService.getAllRoles().subscribe({
      next: (roles) => this.roles = roles,
      error: () => this.toastr.error('Failed to load roles')
    });
  }

  loadPermissions(): void {
    this.roleService.getAllPermissions().subscribe({
      next: (permissions) => {
        this.availablePermissions = permissions;
        this.groupPermissions(permissions);
      },
      error: () => this.toastr.error('Failed to load permissions')
    });
  }

  private groupPermissions(permissions: any[]): void {
    const groups: { [key: string]: any[] } = {};

    permissions.forEach(perm => {
      const category = perm.category || (perm.name ? perm.name.split('_')[0] : 'GENERAL');
      if (!groups[category]) {
        groups[category] = [];
      }
      groups[category].push(perm);
    });

    this.groupedPermissions = Object.keys(groups).map(key => ({
      category: key,
      permissions: groups[key]
    }));
  }

  openRoleModal(): void {
    this.isRoleModalOpen = true;
    this.isEditRoleMode = false;
    this.selectedRoleId = null;
    this.roleForm.reset();
    this.selectedPermissionIds.clear();
  }

  openEditRoleModal(roleId: any): void {
    const roleToEdit = this.roles.find(r => r.id == roleId);
    if (!roleToEdit) return;

    this.isRoleModalOpen = true;
    this.isEditRoleMode = true;
    this.selectedRoleId = roleId;
    
    this.roleForm.patchValue({ name: roleToEdit.name });
    
    const currentPerms = roleToEdit.permissions || [];
    this.selectedPermissionIds = new Set(currentPerms.map((p: any) => p.id || p));
  }

  closeRoleModal(): void {
    this.isRoleModalOpen = false;
    this.roleForm.reset();
    this.selectedPermissionIds.clear();
  }

  onRoleSelectChange(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue === 'NEW') {
      this.userForm.patchValue({ roleId: '' });
      this.openRoleModal();
    }
  }

  togglePermission(permId: any): void {
    if (this.selectedPermissionIds.has(permId)) {
      this.selectedPermissionIds.delete(permId);
    } else {
      this.selectedPermissionIds.add(permId);
    }
  }

  isPermissionSelected(permId: any): boolean {
    return this.selectedPermissionIds.has(permId);
  }

  toggleGroup(group: PermissionGroup): void {
    const isFullySelected = this.isGroupFullySelected(group);
    
    group.permissions.forEach(perm => {
      if (isFullySelected) {
        this.selectedPermissionIds.delete(perm.id);
      } else {
        this.selectedPermissionIds.add(perm.id);
      }
    });
  }

  isGroupFullySelected(group: PermissionGroup): boolean {
    return group.permissions.length > 0 && 
           group.permissions.every(perm => this.selectedPermissionIds.has(perm.id));
  }

  toggleAllPermissions(): void {
    if (this.isAllSelected()) {
      this.selectedPermissionIds.clear();
    } else {
      this.availablePermissions.forEach(perm => this.selectedPermissionIds.add(perm.id));
    }
  }

  isAllSelected(): boolean {
    return this.availablePermissions.length > 0 && 
           this.selectedPermissionIds.size === this.availablePermissions.length;
  }

  onSaveRole(): void {
    if (this.roleForm.invalid) {
      this.roleForm.markAllAsTouched();
      return;
    }

    const rolePayload = {
      name: this.roleForm.value.name,
      permissionIds: Array.from(this.selectedPermissionIds)
    };

    if (this.isEditRoleMode && this.selectedRoleId) {
      this.roleService.updateRole(this.selectedRoleId, rolePayload).subscribe({
        next: () => {
          this.toastr.success('Role updated successfully');
          this.loadRoles();
          this.closeRoleModal();
        },
        error: (err) => this.toastr.error(err.error?.message || 'Failed to update role')
      });
    } else {
      this.roleService.createRole(rolePayload).subscribe({
        next: (newRole) => {
          this.toastr.success('Role created successfully');
          this.loadRoles();
          this.userForm.patchValue({ roleId: newRole.id });
          this.closeRoleModal();
        },
        error: (err) => this.toastr.error(err.error?.message || 'Failed to create role')
      });
    }
  }

  onSelectRoleToEdit(event: Event): void {
    const selectedValue = (event.target as HTMLSelectElement).value;
    if (selectedValue === 'NEW') {
      this.switchRoleToCreateMode();
    } else {
      this.openEditRoleModal(selectedValue);
    }
  }

  switchRoleToCreateMode(): void {
    this.isEditRoleMode = false;
    this.selectedRoleId = null;
    this.roleForm.reset();
    this.selectedPermissionIds = new Set();
  }
}