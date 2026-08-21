import { useState } from "react";
import { Input } from "../../../common/components/Input";
import { Button } from "../../../common/components/Button";
import { ErrorBanner } from "../../../common/components/ErrorBanner";
import { useLogin } from "../hooks/useLogin";

export function LoginPage() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const { submit, loading, error, clearError } = useLogin();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    submit(username, password);
  }

  return (
    <div className="min-h-screen grid md:grid-cols-[44%_56%]">
      <div className="hidden md:flex flex-col justify-between p-14 bg-gradient-to-br from-slate-900 via-[#151b2e] to-[#0e1220] border-r border-slate-800 relative overflow-hidden">
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{ backgroundImage: "radial-gradient(circle, white 1px, transparent 1px)", backgroundSize: "24px 24px" }}
        />
        <div className="relative flex flex-col gap-8">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center shrink-0">
              <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4">
                <path d="M3 7l9-4 9 4-9 4-9-4z" stroke="#1a1508" strokeWidth="1.6" strokeLinejoin="round"/>
                <path d="M3 7v10l9 4 9-4V7" stroke="#1a1508" strokeWidth="1.6" strokeLinejoin="round"/>
                <path d="M12 11v10" stroke="#1a1508" strokeWidth="1.6"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-400 tracking-wide">PRODUCT INVENTORY SERVICE</span>
          </div>
          <h1 className="text-4xl font-bold text-slate-50 leading-tight max-w-xs">
            Every unit, <span className="text-amber-400">tracked and accounted for.</span>
          </h1>
          <p className="text-slate-400 text-sm max-w-xs leading-relaxed">
            Sign in to manage stock levels, review inventory movement, and administer accounts.
          </p>

          <div className="border border-slate-800 rounded-xl bg-black/20 overflow-hidden">
            <div className="px-4 py-2.5 border-b border-slate-800 text-xs tracking-wide text-slate-500 font-mono">
              RECENT ACTIVITY (SAMPLE)
            </div>
            <div className="divide-y divide-slate-800/60">
              {[
                { sku: "SKU-2041", delta: "+150", loc: "Warehouse A", up: true },
                { sku: "SKU-1187", delta: "−12", loc: "Warehouse B", up: false },
                { sku: "SKU-3390", delta: "+64", loc: "Warehouse A", up: true },
              ].map((row) => (
                <div key={row.sku} className="flex justify-between px-4 py-2.5 font-mono text-xs">
                  <span className="text-slate-400">{row.sku}</span>
                  <span className={row.up ? "text-emerald-400" : "text-red-400"}>{row.delta}</span>
                  <span className="text-slate-600">{row.loc}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="relative flex gap-6 text-xs">
          <div><p className="font-semibold text-slate-300">Admin</p><p className="text-slate-500">Full access</p></div>
          <div><p className="font-semibold text-slate-300">Manager</p><p className="text-slate-500">Edit inventory</p></div>
          <div><p className="font-semibold text-slate-300">Viewer</p><p className="text-slate-500">Read only</p></div>
        </div>
      </div>

      <div className="flex items-center justify-center bg-slate-950 px-4 relative">
        <div
          className="absolute inset-0 opacity-30"
          style={{ background: "radial-gradient(ellipse 600px 400px at 50% 0%, rgba(245,158,11,0.08), transparent)" }}
        />
        <form onSubmit={handleSubmit} className="relative w-full max-w-sm">
          <p className="text-xs font-mono tracking-wide text-amber-400 mb-2">AUTHORIZED PERSONNEL ONLY</p>
          <h2 className="text-2xl font-semibold text-slate-100 mb-1">Sign in</h2>
          <p className="text-sm text-slate-400 mb-6">Use your organization credentials to continue.</p>

          {error && (
            <ErrorBanner title="Authentication failed" detail={error.detail} onDismiss={clearError} />
          )}

          <Input id="username" label="Username" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="jane.doe" />
          <Input id="password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />

          <Button type="submit" loading={loading}>Log in</Button>
        </form>
      </div>
    </div>
  );
}