import { Component } from 'react'

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <main className="min-h-screen bg-bg flex items-center justify-center px-4">
        <section className="w-full max-w-md bg-surface border border-bdr rounded-2xl p-6 text-center">
          <div className="w-12 h-12 mx-auto rounded-xl bg-err/10 border border-err/30 flex items-center justify-center mb-4">
            <span className="material-symbols-outlined text-err" style={{ fontSize: 24 }}>error</span>
          </div>
          <h1 className="font-display font-bold text-xl text-tp">Something went off track.</h1>
          <p className="text-sm text-ts mt-2 leading-relaxed">
            The demo is still running. Refresh the screen to recover your session.
          </p>
          <button
            onClick={() => window.location.assign('/home')}
            className="mt-5 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-h text-white text-sm font-semibold transition-colors"
          >
            <span className="material-symbols-outlined" style={{ fontSize: 18 }}>refresh</span>
            Recover demo
          </button>
        </section>
      </main>
    )
  }
}
