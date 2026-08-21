import { useEffect } from "react";
import type { Toast as ToastType } from "./ToastContext";
import { useToast } from "./useToast";

const TYPE_STYLES = {
  success: { ring: "stroke-emerald-400", bar: "bg-emerald-400", text: "text-emerald-300" },
  error: { ring: "stroke-red-400", bar: "bg-red-400", text: "text-red-300" },
  info: { ring: "stroke-amber-400", bar: "bg-amber-400", text: "text-amber-300" },
};

export function Toast({ toast }: { toast: ToastType }) {
  const { removeToast } = useToast();
  const style = TYPE_STYLES[toast.type];

  useEffect(() => {
    const timer = setTimeout(() => removeToast(toast.id), toast.duration);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, removeToast]);

  return (
    <div className="flex items-center gap-3 bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 shadow-xl w-80 animate-slide-in">
      <svg className="w-8 h-8 shrink-0 -rotate-90" viewBox="0 0 36 36">
        <circle cx="18" cy="18" r="15.5" fill="none" stroke="#334155" strokeWidth="3" />
        <circle
          cx="18" cy="18" r="15.5" fill="none" strokeWidth="3"
          className={style.ring}
          strokeDasharray="97.4"
          strokeDashoffset="0"
          style={{ animation: `countdown ${toast.duration}ms linear forwards` }}
        />
      </svg>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold ${style.text}`}>{toast.title}</p>
        {toast.message && <p className="text-xs text-slate-400 truncate">{toast.message}</p>}
      </div>
      <button onClick={() => removeToast(toast.id)} className="text-slate-500 hover:text-slate-300 text-xs shrink-0">✕</button>
    </div>
  );
}