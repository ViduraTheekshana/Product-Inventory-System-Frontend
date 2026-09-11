import type { ApiError } from "../types/api.types";
import { getToken } from "./tokenStore";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function request<T>(path: string, method: string, body?: unknown): Promise<T> {
  const token = getToken();

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw error;
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return response.json();
}

export const apiClient = {
  get: <T>(path: string) => request<T>(path, "GET"),
  post: <T>(path: string, body?: unknown) => request<T>(path, "POST", body),
  patch: <T>(path: string, body?: unknown) => request<T>(path, "PATCH", body),
  delete: <T>(path: string, body?: unknown) => request<T>(path, "DELETE", body),
};

// Same as apiClient.get, but also returns the raw Response headers -
// needed specifically for reading X-Sort-Warning, which lives in the
// HTTP headers, not the JSON body. Kept separate from the regular get()
// so every other call site stays untouched and simple.
export async function getWithHeaders<T>(path: string): Promise<{ data: T; headers: Headers }> {
  const token = getToken();
  const headers: Record<string, string> = {};
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  const response = await fetch(`${BASE_URL}${path}`, { headers });

  if (!response.ok) {
    const error: ApiError = await response.json();
    throw error;
  }

  const data: T = await response.json();
  return { data, headers: response.headers };
}