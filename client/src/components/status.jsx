export function LoadingState({ label = "Loading data" }) {
  return <div className="flex min-h-72 items-center justify-center gap-3 text-muted-foreground"><span className="h-5 w-5 animate-spin rounded-full border-2 border-input border-t-primary" />{label}</div>;
}

export function ErrorState({ message }) {
  return <div className="flex min-h-72 items-center justify-center text-destructive">{message}</div>;
}

export function EmptyState({ title, description }) {
  return <div className="flex min-h-72 flex-col items-center justify-center gap-2 text-center text-muted-foreground"><strong className="text-foreground">{title}</strong><span>{description}</span></div>;
}
