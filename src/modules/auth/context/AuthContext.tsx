import { createContext, useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { setTokens, getRefreshToken, loadPersistedRefreshToken, registerAuthFailureHandler } from "../../../common/api/tokenStore";
import { logout as logoutRequest, refresh as refreshRequest } from "../api/authApi";

interface DecodedToken {
  sub: string;
  role: string;
}

interface AuthContextType {
  accessToken: string | null;
  role: string | null;
  username: string | null;
  isInitializing: boolean;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessTokenState] = useState<string | null>(null);
  const [role, setRole] = useState<string | null>(null);
  const [username, setUsername] = useState<string | null>(null);
  const [isInitializing, setIsInitializing] = useState(true);
  const navigate = useNavigate();

  function applyTokens(newAccessToken: string, newRefreshToken: string) {
    setAccessTokenState(newAccessToken);
    setTokens(newAccessToken, newRefreshToken);
    const decoded = jwtDecode<DecodedToken>(newAccessToken);
    setRole(decoded.role);
    setUsername(decoded.sub);
  }

  function login(newAccessToken: string, newRefreshToken: string) {
    applyTokens(newAccessToken, newRefreshToken);
  }

  async function logout() {
    const refreshToken = getRefreshToken();
    try {
      if (refreshToken) await logoutRequest({ refreshToken });
    } catch {
      // fail-open
    } finally {
      setAccessTokenState(null);
      setTokens(null, null);
      setRole(null);
      setUsername(null);
    }
  }

  useEffect(() => {
    async function restoreSession() {
      const persistedRefreshToken = loadPersistedRefreshToken();
      if (!persistedRefreshToken) {
        setIsInitializing(false);
        return;
      }
      try {
        const data = await refreshRequest(persistedRefreshToken);
        applyTokens(data.accessToken, data.refreshToken);
      } catch {
        setTokens(null, null);
      } finally {
        setIsInitializing(false);
      }
    }
    restoreSession();
  }, []);

  useEffect(() => {
    registerAuthFailureHandler(() => {
      logout();
      navigate("/login");
    });
  }, []);

  return (
    <AuthContext.Provider value={{ accessToken, role, username, isInitializing, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}