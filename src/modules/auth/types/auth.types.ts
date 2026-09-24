// This mirrors your backend's Java records exactly - a TypeScript
// "interface" is the direct equivalent of a DTO shape.
export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

// Mirrors the backend's LogoutRequest record (see AuthService.logout):
// the client sends back the refresh token it's holding, so the server
// can look up its jti and mark that specific session revoked.
export interface LogoutRequest {
  refreshToken: string;
}