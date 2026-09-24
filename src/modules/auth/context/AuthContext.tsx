import { createContext, useState, useEffect, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import { setTokens, getRefreshToken, registerAuthFailureHandler } from "../../../common/api/tokenStore";
import { logout as logoutRequest } from "../api/authApi";

interface DecodedToken {
  sub: string;
  role: string;
}

interface AuthContextType {
  accessToken: string | null;
  role: string | null;
  username: string | null;
  login: (accessToken: string, refreshToken: string) => void;
  logout: () => Promise<void>;
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

  async function logout() {
    const refreshToken = getRefreshToken();

    try {
      // Only bother calling the backend if we actually have a refresh
      // token to revoke. If we don't (already logged out somehow),
      // there's nothing meaningful to tell the server.
      if (refreshToken) {
        await logoutRequest({ refreshToken });
      }
    } catch {
      // Deliberately swallowed: this is "fail open" logout. Even if the
      // network request fails (offline, server down, token already
      // expired), the user still gets logged out on THIS device below.
      // We don't want a network blip to trap someone in a session they
      // clicked "log out" on. The backend-side session may briefly
      // stay valid until it naturally expires, but that's an accepted
      // trade-off for logout specifically - not for login.
    } finally {
      setAccessTokenState(null);
      setTokens(null, null);
      setRole(null);
      setUsername(null);
    }
  }

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