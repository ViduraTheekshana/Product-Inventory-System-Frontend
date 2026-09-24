import { Link } from "react-router-dom";
import { useAuth } from "../../modules/auth/hooks/useAuth";

// Turns a username into a two-letter avatar badge: "admin" -> "AD".
function getInitials(username: string): string {
  return username.slice(0, 2).toUpperCase();
}

const ROLE_BADGE_STYLES: Record<string, string> = {
  ADMIN: "bg-amber-400/10 text-amber-300 border-amber-400/30",
  MANAGER: "bg-sky-400/10 text-sky-300 border-sky-400/30",
  VIEWER: "bg-slate-400/10 text-slate-300 border-slate-400/30",
};

export function AppHeader() {
  // Destructuring straight off useAuth() now, matching its ACTUAL
  // shape: { accessToken, role, username, login, logout }. No nested
  // "user" object exists - that was my earlier, wrong guess.
  const { username, role, logout } = useAuth();

  // Defensive guard: AppHeader only ever renders inside ProtectedRoute,
  // so username/role should always be set here - but "should always
  // be" isn't "guaranteed," so we still check before rendering, rather
  // than risk a crash reading .slice() on null.
  if (!username || !role) return null;

  const roleStyle = ROLE_BADGE_STYLES[role] ?? ROLE_BADGE_STYLES.VIEWER;

  // This mirrors the backend's own rule exactly:
  // SecurityConfig.java -> .requestMatchers("/api/v1/users/**").hasRole(Role.ADMIN.name())
  // Only ADMIN can reach user-management endpoints, so only ADMIN
  // gets a clickable identity block here. This frontend check is
  // purely a UX convenience (don't show a link that leads nowhere
  // useful) - it is NOT the security boundary. The backend's
  // hasRole() check above is what actually protects the data,
  // even if someone bypassed the frontend entirely.
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
      {/* Brand, left side */}
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

      {/* Identity + logout, right side */}
      <div className="flex items-center gap-4">
        <div className="border-r border-slate-800 pr-4">
          {canManageUsers ? (
            <Link
              to="/user-management"
              title="Manage users"
              className="-m-1.5 flex rounded-lg p-1.5 transition hover:bg-slate-800/60"
            >
              {identityBlock}
            </Link>
          ) : (
            // VIEWER and MANAGER see the exact same visual block, just
            // not wrapped in a link - no hover effect, not clickable.
            // This is a deliberate, quiet signal: "this isn't a button
            // for you," without needing an explicit disabled state.
            identityBlock
          )}
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-1.5 rounded-lg border border-red-500/30 bg-red-500/10 px-3 py-1.5 text-xs font-semibold text-red-400 transition hover:bg-red-500/20"
        >
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