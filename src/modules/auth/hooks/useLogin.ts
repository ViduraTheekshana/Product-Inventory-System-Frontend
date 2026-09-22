import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { login as loginApi } from "../api/authApi";
import { useAuth } from "./useAuth";
import { useToast } from "../../../common/toast/useToast";
import type { ApiError } from "../../../common/types/api.types";

/**
 * This is the "Service" for the login feature - it owns every decision
 * about what happens on success/failure, and every piece of related
 * state (loading, error). LoginPage no longer needs to know any of this;
 * it just calls submit() and reads the values this hook exposes.
 */
export function useLogin() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);

  const { login } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  async function submit(username: string, password: string) {
    setError(null);
    setLoading(true);

    try {
      const response = await loginApi({ username, password });
      login(response.accessToken, response.refreshToken);
      showToast({ type: "success", title: "Welcome back", message: `Signed in as ${username}`, duration: 4000 });
      navigate("/products");
    } catch (err) {
      const apiError = err as ApiError;
      setError(apiError);
      showToast({ type: "error", title: "Login failed", message: apiError.detail, duration: 4000 });
    } finally {
      setLoading(false);
    }
  }

  function clearError() {
    setError(null);
  }

  return { submit, loading, error, clearError };
}