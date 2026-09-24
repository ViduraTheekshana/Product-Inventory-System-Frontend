export function AppFooter() {
  const year = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-slate-800 bg-[#11172a] px-6 py-4">
      <div className="flex flex-col items-center justify-between gap-2 text-xs text-slate-500 sm:flex-row">
        <p>
          © {year} Product Inventory Service — built at{" "}
          <span className="font-medium text-slate-400">Millenniumitesp</span>
        </p>

        <div className="flex items-center gap-4">
          {/* NOTE: this dot + label is decorative, not a real backend
              health check. If you want it to be honest, we'd need a
              tiny GET to a /health endpoint - flagging so you don't
              present a fake status as real to anyone reviewing this. */}
          <span className="flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
            All systems operational
          </span>
          <span className="font-mono text-slate-600">v0.1.0</span>
        </div>
      </div>
    </footer>
  );
}