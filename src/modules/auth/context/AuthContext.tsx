import { createContext, useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { setTokens, registerAuthFailureHandler } from "../../../common/api/tokenStore";

interface DecodedToken {
  sub: string;
  role: string;
}

interface AuthContextType {
  accessToken: string | null;
  role: string | null;
  username: string | null;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const navigate = useNavigate();

  function login(newAccessToken: string, newRefreshToken: string) {
    setAccessTokenState(newAccessToken);
    setTokens(newAccessToken, newRefreshToken);

    const decoded = jwtDecode<DecodedToken>(newAccessToken);
    setRole(decoded.role);
    setUsername(decoded.sub);
  }

  function logout() {
    setAccessTokenState(null);
    setTokens(null, null);
    setRole(null);
    setUsername(null);
  }

  // Registered once, on mount - this is how apiClient (which cannot use
  // React hooks itself) tells the app "the refresh attempt failed too,
  // the session is genuinely over" and gets redirected correctly.
  useEffect(() => {
    registerAuthFailureHandler(() => {
      logout();
      navigate("/login");
    });
  }, []);

  return (
    <AuthContext.Provider value={{ accessToken, role, username, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}