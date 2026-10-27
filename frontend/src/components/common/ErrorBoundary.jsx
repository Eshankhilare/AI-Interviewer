import { Component } from 'react'

/**
 * Last line of defense against a white screen: renders a retry card instead of
 * unmounting the whole app when a child throws during render.
 */
class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false }
  }

  static getDerivedStateFromError() {
    return { hasError: true }
  }

  componentDidCatch(error, info) {
    console.error(`[${this.props.label || 'app'}] render error:`, error, info?.componentStack)
  }

  render() {
    if (!this.state.hasError) return this.props.children

    const compact = this.props.compact
    return (
      <div
        role="alert"
        className={compact
          ? 'p-4 rounded-xl text-sm'
          : 'min-h-[60vh] flex items-center justify-center p-6'}
        style={compact
          ? { background: 'var(--surface-1)', border: '1px solid var(--border)', color: 'var(--color-ink)' }
          : { background: '#000', color: '#fff' }}
      >
        <div className={compact ? '' : 'max-w-md text-center'}>
          <p className="font-semibold mb-2">Something went wrong in this section.</p>
          <p className="text-sm mb-4" style={{ opacity: 0.6 }}>
            The rest of the interview is unaffected. You can retry, or continue in text mode.
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="px-4 py-2 rounded-xl text-sm font-semibold bg-indigo-500 hover:bg-indigo-400 text-white"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }
}

export default ErrorBoundary
