import { createContext, useState, type ReactNode } from "react";
import { jwtDecode } from "jwt-decode";
import { setToken } from "../../../common/api/tokenStore";

interface DecodedToken {
  sub: string;
  role: string;
}

interface AuthContextType {
  accessToken: string | null;
  role: string | null;
  username: string | null;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);

  function login(token: string) {
    setAccessToken(token);
    setToken(token);

    // The role and username already live inside the JWT itself - we
    // decode them here rather than making a separate API call, exactly
    // matching how JwtAuthenticationProvider reads the "role" claim
    // straight off the token on the backend.
    const decoded = jwtDecode<DecodedToken>(token);
    setRole(decoded.role);
    setUsername(decoded.sub);
  }

  function logout() {
    setAccessToken(null);
    setToken(null);
    setRole(null);
    setUsername(null);
  }

  return (
    <AuthContext.Provider value={{ accessToken, role, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}