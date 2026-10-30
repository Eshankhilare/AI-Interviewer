/**
 * Development-only timing helpers.
 *
 * Calls are no-ops in production and in the test runner, so no timings or
 * request details end up in the shipped bundle or CI output. Only durations
 * and non-sensitive metadata should ever be passed in — never credentials,
 * JWTs or user data.
 */
const ENABLED = import.meta.env.DEV && import.meta.env.MODE !== 'test'

export const perfStart = () => (ENABLED ? performance.now() : 0)

export const perfEnd = (label, startedAt, details) => {
  if (!ENABLED || !startedAt) return
  const duration = performance.now() - startedAt
  if (details === undefined) {
    console.debug(`[perf] ${label}: ${duration.toFixed(1)}ms`)
  } else {
    console.debug(`[perf] ${label}: ${duration.toFixed(1)}ms`, details)
  }
}
