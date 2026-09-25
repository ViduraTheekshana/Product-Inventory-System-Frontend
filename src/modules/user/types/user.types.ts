export type Role = "ADMIN" | "MANAGER" | "VIEWER";
export type UserStatus = "ACTIVE" | "INACTIVE" | "DELETED";

// id is a UUID string, NOT a number - unlike Product.
export interface User {
  id: string;
  username: string;
  role: Role;
  status: UserStatus;
}

export interface CreateUserRequest {
  username: string;
  password: string;
  role: Role;
}

export interface AssignRoleRequest {
  role: Role;
}

export interface PagedUsers {
  content: User[];
  page: { size: number; number: number; totalElements: number; totalPages: number };
}