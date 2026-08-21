export function LoadingSpinner({ size = "md" }: { size?: "sm" | "md" }) {
  const dimension = size === "sm" ? "w-4 h-4" : "w-8 h-8";
  return (
    <div className={`${dimension} border-2 border-slate-600 border-t-amber-500 rounded-full animate-spin`} />
  );
}