import { Suspense, lazy } from 'react'
import { useUIVersion } from './store'

// The shells are only needed after sign-in. Keeping them out of the initial
// bundle stops the login/register page from downloading the studio nav, the
// WebGL background and the classic layout.
const Layout = lazy(() => import('../components/common/Layout'))
const StudioShell = lazy(() => import('./Shell'))

const Fallback = () => (
  <div style={{ minHeight: 240, display: 'grid', placeItems: 'center' }}>
    <div className="animate-spin rounded-full h-7 w-7 border-2 border-white/20 border-t-white" />
  </div>
)

const ChromeFallback = () => (
  <div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center' }}>
    <div className="animate-spin rounded-full h-7 w-7 border-2 border-white/20 border-t-white" />
  </div>
)

export const UIChrome = () => {
  const { version } = useUIVersion()
  return (
    <Suspense fallback={<ChromeFallback />}>
      {version === 'classic' ? <Layout /> : <StudioShell />}
    </Suspense>
  )
}

export const UIPage = ({ classic, studio }) => {
  const { version } = useUIVersion()
  return <Suspense fallback={<Fallback />}>{version === 'classic' ? classic : studio}</Suspense>
}
