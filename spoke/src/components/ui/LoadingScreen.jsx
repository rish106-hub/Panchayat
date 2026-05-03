export function LoadingScreen() {
  return (
    <main className="min-h-screen bg-bg flex items-center justify-center px-4">
      <section className="w-full max-w-sm space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/30 flex items-center justify-center">
            <span className="material-symbols-outlined text-primary icon-filled" style={{ fontSize: 22 }}>spatial_audio</span>
          </div>
          <div>
            <p className="font-display font-bold text-tp">Spoke</p>
            <p className="text-xs text-tm">Preparing demo workspace</p>
          </div>
        </div>
        <div className="bg-surface border border-bdr rounded-2xl p-4 space-y-3">
          <div className="h-3 w-2/3 rounded bg-surface-raised animate-pulse" />
          <div className="h-3 w-full rounded bg-surface-raised animate-pulse" />
          <div className="h-3 w-5/6 rounded bg-surface-raised animate-pulse" />
        </div>
      </section>
    </main>
  )
}
