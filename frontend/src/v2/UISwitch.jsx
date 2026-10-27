import { Suspense } from 'react'
import Layout from '../components/common/Layout'
import StudioShell from './Shell'
import { useUIVersion } from './store'

const Fallback = () => (
  <div style={{ minHeight: 240, display: 'grid', placeItems: 'center' }}>
    <div className="animate-spin rounded-full h-7 w-7 border-2 border-white/20 border-t-white" />
  </div>
)

export const UIChrome = () => {
  const { version } = useUIVersion()
  return version === 'classic' ? <Layout /> : <StudioShell />
}

export const UIPage = ({ classic, studio }) => {
  const { version } = useUIVersion()
  return <Suspense fallback={<Fallback />}>{version === 'classic' ? classic : studio}</Suspense>
}
