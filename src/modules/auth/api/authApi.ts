import type { LoginRequest, LoginResponse } from "../types/auth.types";
import { apiClient } from "../../../common/api/apiClient";

export function login(request: LoginRequest): Promise<LoginResponse> {
  return apiClient.post<LoginResponse>("/api/v1/auth/login", request);
}