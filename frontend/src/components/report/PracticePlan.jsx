import { Link } from 'react-router-dom'
import { ArrowRight, Target } from 'lucide-react'
import { buildPracticePlan } from '../../utils/practicePlan'

const PracticePlan = ({ radar, breakdown }) => {
  const steps = buildPracticePlan({ radar, breakdown })
  if (steps.length === 0) return null

  return (
    <div className="p-6" style={{ background: 'var(--surface-1)', border: '1px solid var(--border)', borderRadius: 16 }}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-xl badge-primary">
            <Target className="h-5 w-5" style={{ color: 'var(--color-accent)' }} />
          </div>
          <h2 className="text-lg font-bold" style={{ color: 'var(--color-ink)' }}>Your practice plan</h2>
        </div>
        <span className="text-xs" style={{ color: 'rgba(255,255,255,.35)' }}>from this report, no new model call</span>
      </div>

      <ol className="space-y-3">
        {steps.map((step, index) => (
          <li key={step.title} className="flex gap-3">
            <span className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
              style={{ background: 'rgba(245,158,11,.18)', color: '#a5b4fc' }}>{index + 1}</span>
            <div>
              <p className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,.85)' }}>{step.title}</p>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,.5)' }}>{step.detail}</p>
            </div>
          </li>
        ))}
      </ol>

      <Link to="/interview/new" className="inline-flex items-center gap-2 mt-5 text-sm font-medium" style={{ color: '#a5b4fc' }}>
        Practise this now <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  )
}

export default PracticePlan
