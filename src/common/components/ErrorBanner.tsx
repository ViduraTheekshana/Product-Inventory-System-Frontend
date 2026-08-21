interface ErrorBannerProps {
  title: string;
  detail: string;
  onDismiss?: () => void;
}

export function ErrorBanner({ title, detail, onDismiss }: ErrorBannerProps) {
  return (
    <div className="flex gap-3 bg-red-500/10 border border-red-500/30 rounded-lg px-3.5 py-3 mb-5">
      <div className="w-0.5 bg-red-400 rounded-full shrink-0" />
      <div className="flex-1">
        <p className="text-sm font-semibold text-red-300">{title}</p>
        <p className="text-sm text-red-300/80">{detail}</p>
      </div>
      {onDismiss && (
        <button onClick={onDismiss} className="text-red-400/60 hover:text-red-300 text-sm">✕</button>
      )}
    </div>
  );
}