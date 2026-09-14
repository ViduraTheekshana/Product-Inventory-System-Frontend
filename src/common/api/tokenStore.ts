// Now holds BOTH tokens, plus a way for apiClient (plain code, not a
// hook) to signal "the session is truly dead" back up to AuthContext.
let currentAccessToken: string | null = null;
let currentRefreshToken: string | null = null;
let authFailureHandler: (() => void) | null = null;

export function setTokens(accessToken: string | null, refreshToken: string | null) {
  currentAccessToken = accessToken;
  currentRefreshToken = refreshToken;
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

// AuthProvider registers itself here once, on mount, so apiClient can
// call back into it without needing to be a React component itself.
export function registerAuthFailureHandler(handler: () => void) {
  authFailureHandler = handler;
}

export function triggerAuthFailure() {
  if (authFailureHandler) authFailureHandler();
}