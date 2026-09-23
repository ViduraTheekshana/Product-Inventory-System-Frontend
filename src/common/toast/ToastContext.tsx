import { createContext, useState, useCallback, useMemo, type ReactNode } from "react";

export interface Toast {
  id: string;
  type: "success" | "error" | "info";
  title: string;
  message?: string;
  duration: number;
}

interface ToastContextType {
  toasts: Toast[];
  showToast: (toast: Omit<Toast, "id">) => void;
  removeToast: (id: string) => void;
}

export const ToastContext = createContext<ToastContextType | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);

  // useCallback with an empty dependency array + the functional setState
  // form (prev => ...) means these functions are created ONCE, on the
  // first render, and keep the exact same reference forever after.
  // They never need to be recreated because they never read any
  // outside variable directly - they only receive `prev` from React itself.
  const showToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = crypto.randomUUID();
    setToasts((prev) => [...prev, { ...toast, id }]);
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  // useMemo keeps the context VALUE object itself stable too. Without
  // this, even with showToast/removeToast now stable, a new {..} object
  // literal would still be created every render, and consumers would
  // still see it as "changed." This only produces a new value object
  // when toasts actually changes - which is exactly when consumers
  // SHOULD re-render.
  const value = useMemo(
    () => ({ toasts, showToast, removeToast }),
    [toasts, showToast, removeToast]
  );

  return (
    <ToastContext.Provider value={value}>
      {children}
    </ToastContext.Provider>
  );
}