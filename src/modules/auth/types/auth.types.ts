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

