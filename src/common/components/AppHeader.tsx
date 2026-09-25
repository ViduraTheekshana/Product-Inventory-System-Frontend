import { Link } from "react-router-dom";
import { useAuth } from "../../modules/auth/hooks/useAuth";

function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

const ROLE_BADGE_STYLES: Record<string, string> = {
  ADMIN: "bg-amber-400/10 text-amber-300 border-amber-400/30",
  MANAGER: "bg-sky-400/10 text-sky-300 border-sky-400/30",
  VIEWER: "bg-slate-400/10 text-slate-300 border-slate-400/30",
};

export function AppHeader() {
  const { username, role, logout } = useAuth();

  if (!username || !role) return null;

  const roleStyle = ROLE_BADGE_STYLES[role] ?? ROLE_BADGE_STYLES.VIEWER;
  const canManageUsers = role === "ADMIN";

  const identityBlock = (
    <div className="flex items-center gap-3">
      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-indigo-500/20 font-mono text-xs font-semibold text-indigo-300 ring-1 ring-inset ring-indigo-400/30">
        {getInitials(username)}
      </div>
      <div className="flex flex-col items-center leading-tight">
        <p className="text-sm font-medium text-slate-100">{username}</p>
        <span className={`inline-block rounded-full border px-2 py-[1px] text-[10px] font-semibold uppercase tracking-wide ${roleStyle}`}>
          {role}
        </span>
      </div>
    </div>
  );

  return (
    <header className="sticky top-0 z-40 flex items-center justify-between border-b border-slate-800 bg-[#11172a]/95 px-6 py-3 backdrop-blur">
      <div className="flex items-center gap-3">
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-amber-400 to-amber-500 text-[#151b2e] shadow-lg shadow-amber-500/20">
          <svg viewBox="0 0 24 24" fill="none" className="h-5 w-5">
            <path d="M12 2 3 7v10l9 5 9-5V7l-9-5Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
            <path d="M3 7l9 5 9-5M12 12v10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <div className="leading-tight">
          <p className="font-heading text-sm font-semibold uppercase tracking-[0.14em] text-slate-100">
            Product Inventory Service
          </p>
          <p className="text-[11px] uppercase tracking-wide text-slate-500">
            Internal operations console
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="border-r border-slate-800 pr-4">
          {canManageUsers ? (
            // Hover switched from a barely-visible slate tint to an
            // amber-tinted background + border - now clearly readable
            // as interactive, and consistent with the app's accent color.
            <Link
              to="/user-management"
              title="Manage users"
              className="-m-1.5 flex rounded-lg border border-transparent p-1.5 transition-colors hover:border-amber-400/20 hover:bg-amber-400/5"
            >
              {identityBlock}
            </Link>
          ) : (
            identityBlock
          )}
        </div>

        <button onClick={logout} className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/20">
          <svg viewBox="0 0 24 24" fill="none" className="h-3.5 w-3.5">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            <path d="M16 17l5-5-5-5M21 12H9" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Log out
        </button>
      </div>
    </header>
  );
}