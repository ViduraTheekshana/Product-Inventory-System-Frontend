import { useState } from "react";
import { Navigate, Link } from "react-router-dom";
import { useAuth } from "../../auth/hooks/useAuth";
import { useUsers } from "../hooks/useUsers";
import { UserRow } from "../components/UserRow";
import { CreateUserPanel } from "../components/CreateUserPanel";
import { ConfirmDialog } from "../components/ConfirmDialog";
import { LoadingSpinner } from "../../../common/components/LoadingSpinner";
import { ErrorBanner } from "../../../common/components/ErrorBanner";
import type { User, Role } from "../types/user.types";

type PendingAction =
  | { type: "selfRoleChange"; user: User; newRole: Role }
  | { type: "delete"; user: User }
  | null;

export function UserManagementPage() {
  const { username, role, logout } = useAuth();

  if (role !== "ADMIN") {
    return <Navigate to="/products" replace />;
  }

  const { users, page, setPage, totalPages, totalElements, loading, error, create, changeRole, suspend, reactivate, remove } = useUsers();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [pending, setPending] = useState<PendingAction>(null);

  function handleRoleChangeRequest(user: User, newRole: Role) {
    if (newRole === user.role) return;
    if (user.username === username) {
      setPending({ type: "selfRoleChange", user, newRole });
    } else {
      changeRole(user.id, { role: newRole });
    }
  }

  function handleDeleteRequest(user: User) {
    setPending({ type: "delete", user });
  }

  async function handleConfirm() {
    if (!pending) return;
    if (pending.type === "selfRoleChange") {
      await changeRole(pending.user.id, { role: pending.newRole });
      setPending(null);
      await logout();
    } else {
      await remove(pending.user.id);
      setPending(null);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <div className="mx-auto max-w-5xl p-7">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
          <div>
            {/* "group" lets the arrow icon react to hovering ANYWHERE
                on the pill, not just directly over the svg itself.
                On hover: border/background/text pick up the amber
                accent (matching the header's identity-block hover),
                and the arrow slides left slightly via translate-x. */}
            <Link
              to="/products"
              className="group mb-2 inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/60 px-3 py-1.5 text-xs font-medium text-slate-400 transition-colors hover:border-amber-400/30 hover:bg-amber-400/5 hover:text-amber-300"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                className="h-3.5 w-3.5 shrink-0 transition-transform duration-150 ease-out group-hover:-translate-x-0.5"
              >
                <path d="M15 6l-6 6 6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Back to Products
            </Link>
            <h1 className="text-2xl font-bold">User Management</h1>
            <p className="mt-1 text-sm text-slate-400">Manage accounts, roles, and access across your organization.</p>
          </div>
          <button onClick={() => setIsCreateOpen(true)} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400">
            + Create User
          </button>
        </div>

        {error && <ErrorBanner title={error.title} detail={error.detail} />}

        {loading ? (
          <div className="flex justify-center py-16"><LoadingSpinner /></div>
        ) : (
          <div className="overflow-hidden rounded-xl border border-slate-800 bg-slate-900">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-800 text-left text-xs uppercase tracking-wide text-slate-500">
                  <th className="px-4 py-3">Username</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-center">Actions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <UserRow
                    key={user.id}
                    user={user}
                    isSelf={user.username === username}
                    onRequestRoleChange={handleRoleChangeRequest}
                    onRequestSuspendToggle={(u) => (u.status === "ACTIVE" ? suspend(u.id) : reactivate(u.id))}
                    onRequestDelete={handleDeleteRequest}
                  />
                ))}
              </tbody>
            </table>
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
          <span>Showing page {page + 1} of {Math.max(totalPages, 1)} ({totalElements} total)</span>
          <div className="flex gap-2">
            <button onClick={() => setPage((p) => Math.max(0, p - 1))} disabled={page === 0} className="h-8 w-8 rounded border border-slate-700 disabled:opacity-30">‹</button>
            <button onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))} disabled={page >= totalPages - 1} className="h-8 w-8 rounded border border-slate-700 disabled:opacity-30">›</button>
          </div>
        </div>
      </div>

      <CreateUserPanel isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} onCreate={create} />

      <ConfirmDialog
        open={pending?.type === "selfRoleChange"}
        title="Change your own role?"
        message={pending?.type === "selfRoleChange" ? `You're changing your own role from ${pending.user.role} to ${pending.newRole}. This immediately ends your current session - you'll need to log in again as ${pending.newRole} to continue.` : ""}
        confirmLabel="Change role and log out"
        onConfirm={handleConfirm}
        onCancel={() => setPending(null)}
      />

      <ConfirmDialog
        open={pending?.type === "delete"}
        title="Delete this user?"
        message={pending?.type === "delete" ? `This permanently removes ${pending.user.username}'s access. It cannot be undone through this app.` : ""}
        confirmLabel="Delete user"
        onConfirm={handleConfirm}
        onCancel={() => setPending(null)}
      />
    </div>
  );
}