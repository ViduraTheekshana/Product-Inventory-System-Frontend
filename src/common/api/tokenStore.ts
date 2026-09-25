let currentAccessToken: string | null = null;
let currentRefreshToken: string | null = null;
let authFailureHandler: (() => void) | null = null;

const REFRESH_TOKEN_STORAGE_KEY = "pis_refresh_token";

export function setTokens(accessToken: string | null, refreshToken: string | null) {
  currentAccessToken = accessToken;
  currentRefreshToken = refreshToken;

  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_STORAGE_KEY, refreshToken);
  } else {
    localStorage.removeItem(REFRESH_TOKEN_STORAGE_KEY);
  }
}

export function setAccessToken(token: string | null) {
  currentAccessToken = token;
}

export function getAccessToken(): string | null {
  return currentAccessToken;
}

export function getRefreshToken(): string | null {
  return currentRefreshToken;
}

export function loadPersistedRefreshToken(): string | null {
  const stored = localStorage.getItem(REFRESH_TOKEN_STORAGE_KEY);
  currentRefreshToken = stored;
  return stored;
}

export function registerAuthFailureHandler(handler: () => void) {
  authFailureHandler = handler;
}

export function triggerAuthFailure() {
  if (authFailureHandler) authFailureHandler();
}