import type { LoginRequest, LoginResponse, LogoutRequest } from "../types/auth.types";
import { apiClient } from "../../../common/api/apiClient";

export function login(request: LoginRequest): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>("/api/v1/auth/login", request);
}

export function logout(request: LogoutRequest): Promise<void> {
  return apiClient.post<void>("/api/v1/auth/logout", request);
}

export function refresh(refreshToken: string): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>("/api/v1/auth/refresh", { refreshToken });
}