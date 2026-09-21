// src/app/modules/client/models/user.model.ts

export interface PermissionResponse {
  id: string;
  name: string;
  description?: string;
}

export interface RoleResponse {
  id: string;
  name: string;
  permissions?: PermissionResponse[];
}

export interface RoleNameResponse {
  id: string;
  name: string;
}


export interface UserResponse {
  id: string;
  email: string;
  fullName: string;
  phone?: string;
  role: RoleResponse;
}

export interface CreateUserRequest {
  email: string;
  password: string;
  fullName: string;
  phone?: string;
  roleId: string;
}

export interface UpdateUserRequest {
  fullName: string;
  phone?: string;
  roleId?: string;
}