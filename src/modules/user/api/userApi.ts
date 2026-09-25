import { apiClient, getWithHeaders } from "../../../common/api/apiClient";
import type { User, CreateUserRequest, AssignRoleRequest, PagedUsers } from "../types/user.types";

export function getAllUsers(page: number, size: number, sort?: string) {
  const query = new URLSearchParams({ page: page.toString(), size: size.toString() });
  if (sort) query.set("sort", sort);
  return getWithHeaders<PagedUsers>(`/api/v1/users?${query}`);
}

export function createUser(request: CreateUserRequest): Promise<User> {
  return apiClient.post<User>("/api/v1/users", request);
}

export function assignRole(userId: string, request: AssignRoleRequest): Promise<User> {
  return apiClient.patch<User>(`/api/v1/users/${userId}/role`, request);
}

export function suspendUser(userId: string): Promise<User> {
  return apiClient.patch<User>(`/api/v1/users/${userId}/suspend`);
}

export function reactivateUser(userId: string): Promise<User> {
  return apiClient.patch<User>(`/api/v1/users/${userId}/reactivate`);
}

export function deleteUser(userId: string): Promise<void> {
  return apiClient.delete<void>(`/api/v1/users/${userId}`);
}