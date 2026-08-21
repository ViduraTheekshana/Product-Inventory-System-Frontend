import { createContext, useState, type ReactNode } from "react";
import { setToken } from "../../../common/api/tokenStore";

interface AuthContextType {
  accessToken: string | null;
  login: (token: string) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [accessToken, setAccessToken] = useState<string | null>(null);

  function login(token: string) {
    setAccessToken(token);
    setToken(token); // keeps the plain tokenStore mailbox in sync
  }

  function logout() {
    setAccessToken(null);
    setToken(null);
  }

  return (
    <AuthContext.Provider value={{ accessToken, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}