export const AdminPageFallback = ({ title }: { title: string }) => (
  <div className="flex flex-col gap-4" aria-busy="true" aria-live="polite">
    <h1 className="font-display text-h1 text-foreground">{title}</h1>
    <p className="text-body-sm text-muted-foreground">Loading…</p>
  </div>
)
