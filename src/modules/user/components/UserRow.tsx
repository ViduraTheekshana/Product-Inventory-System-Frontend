import { useState } from "react";
import type { User, Role } from "../types/user.types";

interface UserRowProps {
  user: User;
  isSelf: boolean;
  onRequestRoleChange: (user: User, newRole: Role) => void;
  onRequestSuspendToggle: (user: User) => void;
  onRequestDelete: (user: User) => void;
}

const ROLE_STYLES: Record<Role, string> = {
  ADMIN: "bg-amber-400/10 text-amber-300",
  MANAGER: "bg-sky-400/10 text-sky-300",
  VIEWER: "bg-slate-400/10 text-slate-300",
};

export function UserRow({ user, isSelf, onRequestRoleChange, onRequestSuspendToggle, onRequestDelete }: UserRowProps) {
  const [isEditingRole, setIsEditingRole] = useState(false);

  return (
    <tr className={isSelf ? "bg-amber-500/5" : ""}>
      <td className="px-4 py-3 font-medium text-slate-100">
        {user.username}
        {isSelf && <span className="ml-2 text-[10px] uppercase text-amber-400">(you)</span>}
      </td>
      <td className="px-4 py-3">
        {isEditingRole ? (
          <select
            defaultValue={user.role}
            autoFocus
            onBlur={() => setIsEditingRole(false)}
            onChange={(e) => { onRequestRoleChange(user, e.target.value as Role); setIsEditingRole(false); }}
            className="rounded border border-blue-400 bg-slate-800 px-2 py-1 text-xs"
          >
            <option value="ADMIN">ADMIN</option>
            <option value="MANAGER">MANAGER</option>
            <option value="VIEWER">VIEWER</option>
          </select>
        ) : (
          <span className={`inline-block rounded-full px-2 py-0.5 text-[11px] font-semibold ${ROLE_STYLES[user.role]}`}>{user.role}</span>
        )}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-flex items-center gap-1.5 text-xs font-semibold ${user.status === "ACTIVE" ? "text-emerald-400" : "text-slate-500"}`}>
          <span className="h-1.5 w-1.5 rounded-full bg-current" />
          {user.status === "ACTIVE" ? "Active" : "Suspended"}
        </span>
      </td>
      <td className="px-4 py-3">
        <div className="flex justify-center gap-1">
          <IconButton onClick={() => setIsEditingRole(true)} title="Change role">✎</IconButton>
          <IconButton onClick={() => onRequestSuspendToggle(user)} title={user.status === "ACTIVE" ? "Suspend" : "Reactivate"}>⇄</IconButton>
          <IconButton onClick={() => onRequestDelete(user)} title="Delete">✕</IconButton>
        </div>
      </td>
    </tr>
  );
}

function IconButton({ onClick, title, children }: { onClick: () => void; title: string; children: React.ReactNode }) {
  return (
    <button onClick={onClick} title={title} className="flex h-7 w-7 items-center justify-center rounded border border-slate-700 text-sm text-slate-400 hover:border-blue-400 hover:text-blue-400">
      {children}
    </button>
  );
}