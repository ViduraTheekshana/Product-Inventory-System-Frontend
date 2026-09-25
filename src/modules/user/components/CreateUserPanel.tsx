import { useForm } from "react-hook-form";
import type { CreateUserRequest, Role } from "../types/user.types";

interface CreateUserPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onCreate: (request: CreateUserRequest) => Promise<void>;
}

export function CreateUserPanel({ isOpen, onClose, onCreate }: CreateUserPanelProps) {
  // register: hooks up each input to the form's internal state.
  // handleSubmit: wraps our submit logic - runs validation FIRST,
  // only calls onSubmit if every field passes.
  // formState.errors: whichever fields currently fail validation.
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } =
    useForm<CreateUserRequest>({ defaultValues: { username: "", password: "", role: "VIEWER" as Role } });

  if (!isOpen) return null;

  async function onSubmit(data: CreateUserRequest) {
    await onCreate(data);
    reset();
    onClose();
  }

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/60 px-4">
      <div className="w-full max-w-sm rounded-xl border border-slate-700 bg-slate-900 p-5">
        <h3 className="mb-4 text-base font-semibold text-slate-100">Create user</h3>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-3">
          <div>
            <label className="text-xs text-slate-400">Username</label>
            <input
              {...register("username", { required: "Username is required", minLength: { value: 3, message: "At least 3 characters" } })}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
            />
            {errors.username && <p className="mt-1 text-xs text-red-400">{errors.username.message}</p>}
          </div>

          <div>
            <label className="text-xs text-slate-400">Password</label>
            <input
              type="password"
              {...register("password", { required: "Password is required", minLength: { value: 6, message: "At least 6 characters" } })}
              className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100"
            />
            {errors.password && <p className="mt-1 text-xs text-red-400">{errors.password.message}</p>}
          </div>

          <div>
            <label className="text-xs text-slate-400">Role</label>
            <select {...register("role", { required: true })} className="mt-1 w-full rounded-lg border border-slate-700 bg-slate-800 px-3 py-2 text-sm text-slate-100">
              <option value="VIEWER">Viewer</option>
              <option value="MANAGER">Manager</option>
              <option value="ADMIN">Admin</option>
            </select>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <button type="button" onClick={() => { reset(); onClose(); }} className="rounded-lg border border-slate-700 px-4 py-2 text-sm text-slate-300">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-amber-400 disabled:opacity-50">
              {isSubmitting ? "Creating..." : "Create user"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}