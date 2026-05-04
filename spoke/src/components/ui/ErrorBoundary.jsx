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
      <div className="min-h-screen bg-canvas flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-surface border border-border rounded-2xl p-8 text-center shadow-card-md">
          <div className="w-12 h-12 mx-auto rounded-xl bg-danger/10 border border-danger/20 flex items-center justify-center mb-4">
            <span className="material-symbols-rounded text-danger" style={{ fontSize: 24 }}>error</span>
          </div>
          <h1 className="text-base font-semibold text-text-primary mb-1">Something went wrong</h1>
          <p className="text-sm text-text-muted mb-5">The app hit an unexpected error. Refresh to recover.</p>
          <button
            onClick={() => window.location.assign('/dashboard')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
          >
            <span className="material-symbols-rounded" style={{ fontSize: 16 }}>refresh</span>
            Reload app
          </button>
        </div>
      </div>
    )
  }
}
