import type { ApiError } from "../types/api.types";
import {
  getAccessToken,
  getRefreshToken,
  setTokens,
  triggerAuthFailure,
} from "./tokenStore";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

async function rawRequest(path: string, method: string, body?: unknown): Promise<Response> {
  const token = getAccessToken();
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  return fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });
}

// If several requests happen to 401 at the same moment, they all share
// ONE in-flight refresh call instead of each firing their own - avoids
// a race where multiple simultaneous refreshes could each rotate the
// token and invalidate each other.
let refreshPromise: Promise<boolean> | null = null;

async function tryRefreshAccessToken(): Promise<boolean> {
  if (!refreshPromise) {
    refreshPromise = (async () => {
      const refreshToken = getRefreshToken();
      if (!refreshToken) return false;

      try {
        const res = await fetch(`${BASE_URL}/api/v1/auth/refresh`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ refreshToken }),
        });
        if (!res.ok) return false;

        const data = await res.json();
        setTokens(data.accessToken, data.refreshToken);
        return true;
      } catch {
        return false;
      } finally {
        refreshPromise = null;
      }
    })();
  }
  return refreshPromise;
}

async function request<T>(path: string, method: string, body?: unknown): Promise<T> {
  let response = await rawRequest(path, method, body);

  if (response.status === 401) {
    const refreshed = await tryRefreshAccessToken();
    if (refreshed) {
      // Retry the ORIGINAL request exactly once, now with a fresh token.
      response = await rawRequest(path, method, body);
    }
  }

  if (!response.ok) {
    if (response.status === 401) triggerAuthFailure();
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

export async function getWithHeaders<T>(path: string): Promise<{ data: T; headers: Headers }> {
  let response = await rawRequest(path, "GET");

  if (response.status === 401) {
    const refreshed = await tryRefreshAccessToken();
    if (refreshed) {
      response = await rawRequest(path, "GET");
    }
  }

  if (!response.ok) {
    if (response.status === 401) triggerAuthFailure();
    const error: ApiError = await response.json();
    throw error;
  }

  const data: T = await response.json();
  return { data, headers: response.headers };
}