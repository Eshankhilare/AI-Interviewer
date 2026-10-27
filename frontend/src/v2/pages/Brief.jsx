import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowRight, Briefcase, Sparkles } from 'lucide-react'
import api, { errorMessage } from '../../services/api'
import { Empty, PageHead, Reveal, SkeletonBlock } from '../ui'

const TIER = { JUNIOR: 0, MID: 1, SENIOR: 2, LEAD: 2, ARCHITECT: 2 }
const TIERS = ['BASIC', 'ADVANCED', 'EXPERT']
const tierIndex = (level) => {
  const key = String(level || '').toUpperCase()
  if (key in TIER) return TIER[key]
  const index = TIERS.indexOf(key)
  return index === -1 ? 1 : index
}

export default function Brief() {
  const navigate = useNavigate()
  const [params] = useSearchParams()
  const requestedJob = Number(params.get('job'))
  const prefs = (() => {
    try { return JSON.parse(localStorage.getItem('studio-preferences') || '{}') } catch { return {} }
  })()
  const [jobs, setJobs] = useState(null)
  const [resumes, setResumes] = useState([])
  const [jobId, setJobId] = useState(null)
  const [resumeId, setResumeId] = useState('')
  const [mode, setMode] = useState(prefs.mode === 'VOICE' ? 'VOICE' : 'TEXT')
  const [count, setCount] = useState(() => {
    const value = Number(params.get('count')) || Number(prefs.count)
    return Number.isFinite(value) && value >= 3 && value <= 30 ? value : 10
  })
  const [title, setTitle] = useState('')
  const [notes, setNotes] = useState(() => {
    const focus = params.get('focus')
    if (focus) return `Focus on ${focus}`
    if (prefs.note) return prefs.note
    if (Array.isArray(prefs.focus) && prefs.focus.length) return `Focus on ${prefs.focus.join(', ')}`
    return ''
  })
  const [starting, setStarting] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    let alive = true
    Promise.all([
      api.get('/job-descriptions').catch(() => ({ data: [] })),
      api.get('/resumes').catch(() => ({ data: [] })),
    ]).then(([jobRes, resumeRes]) => {
      if (!alive) return
      setJobs(jobRes.data)
      setResumes(resumeRes.data)
      const initial = jobRes.data.find((job) => job.id === requestedJob) || jobRes.data[0]
      if (initial) {
        setJobId(initial.id)
        setTitle(`Interview · ${initial.title}`)
      }
    })
    return () => { alive = false }
  }, [requestedJob])

  const selected = useMemo(() => (jobs || []).find((job) => job.id === jobId), [jobs, jobId])
  const minutes = Math.max(15, count * 4)
  const tier = tierIndex(selected?.experienceLevel)

  const chooseJob = (job) => {
    setJobId(job.id)
    if (!title || title.startsWith('Interview ·')) setTitle(`Interview · ${job.title}`)
  }

  const start = async () => {
    if (!jobId || starting) return
    setStarting(true)
    setError('')
    try {
      const { data } = await api.post('/interviews/start', {
        jobDescriptionId: jobId,
        resumeId: resumeId ? Number(resumeId) : null,
        title: title.trim() || `Interview · ${selected?.title || 'Practice'}`,
        mode,
        totalQuestions: count,
        durationMinutes: minutes,
        notes: notes.trim() || undefined,
      })
      navigate(`/interview/${data.id}`)
    } catch (err) {
      setError(errorMessage(err, 'Could not start the session. Please retry.'))
      setStarting(false)
    }
  }

  if (jobs === null) {
    return (
      <div className="st-content st-narrow">
        <SkeletonBlock height={38} width={300} />
        <div style={{ height: 20 }} />
        <SkeletonBlock height={320} />
      </div>
    )
  }

  if (!jobs.length) {
    return (
      <div className="st-content st-narrow">
        <PageHead eyebrow="New session" title="Brief the studio" sub="A session needs one job description. It is the source of the questions and the scoring rubric." />
        <div className="st-card">
          <Empty
            icon={Briefcase}
            title="No job description yet"
            action={<Link to="/job-descriptions" className="st-btn st-btn-primary">Add a job description</Link>}
          >
            Paste the role you are preparing for, or start from a template.
          </Empty>
        </div>
      </div>
    )
  }

  return (
    <div className="st-content st-narrow">
      <PageHead
        eyebrow="New session"
        title="Brief the studio"
        sub="Choose the role and the length. Everything else is assembled from the job description, so two clicks are enough."
      />

      <div className="st-flow" aria-hidden="true">
        <span className="st-flow-step is-active"><b>1</b> Brief</span>
        <span className="st-flow-line" />
        <span className="st-flow-step"><b>2</b> Interview</span>
        <span className="st-flow-line" />
        <span className="st-flow-step"><b>3</b> Report</span>
      </div>

      <Reveal>
      <div className="st-grid-2" style={{ gridTemplateColumns: 'minmax(0, 1.6fr) minmax(280px, .9fr)', alignItems: 'start' }}>
        <div className="st-stack" style={{ gap: 18 }}>
          <section className="st-card">
            <div className="st-between" style={{ marginBottom: 14 }}>
              <div>
                <p className="st-eyebrow" style={{ margin: 0 }}>01 · Role</p>
                <h2 className="st-h2" style={{ marginTop: 6 }}>What are you preparing for?</h2>
              </div>
              <Link to="/job-descriptions" className="st-btn st-btn-ghost st-btn-sm">Manage</Link>
            </div>
            <div className="st-stack" style={{ gap: 8 }}>
              {jobs.map((job) => {
                const active = job.id === jobId
                return (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => chooseJob(job)}
                    className={`st-role${active ? ' is-active' : ''}`}
                    aria-pressed={active}
                  >
                    <div className="st-between">
                      <div className="st-row" style={{ minWidth: 0 }}>
                        <span className="st-role-dot" aria-hidden="true" />
                        <div>
                          <strong style={{ fontSize: 14 }}>{job.title}</strong>
                          <p className="st-dim" style={{ margin: '3px 0 0', fontSize: 12 }}>
                            {[job.company, job.location].filter(Boolean).join(' · ') || 'No company'}
                          </p>
                        </div>
                      </div>
                      <span className="st-chip">{TIERS[tierIndex(job.experienceLevel)]}</span>
                    </div>
                  </button>
                )
              })}
            </div>
          </section>

          <section className="st-card">
            <p className="st-eyebrow" style={{ margin: 0 }}>02 · Session</p>
            <h2 className="st-h2" style={{ margin: '6px 0 16px' }}>Shape the round</h2>

            <div className="st-grid-2" style={{ gap: 14 }}>
              <div>
                <label className="st-label" htmlFor="brief-mode">Answer mode</label>
                <div className="st-tabs" style={{ width: '100%' }}>
                  {[['TEXT', 'Text'], ['VOICE', 'Voice']].map(([value, label]) => (
                    <button
                      key={value}
                      type="button"
                      className={`st-tab${mode === value ? ' is-active' : ''}`}
                      style={{ flex: 1 }}
                      onClick={() => setMode(value)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                <p className="st-dim" style={{ fontSize: 11.5, margin: '6px 0 0' }}>
                  Coding questions switch to the editor automatically.
                </p>
              </div>
              <div>
                <label className="st-label" htmlFor="brief-resume">Attach a resume (optional)</label>
                <select id="brief-resume" className="st-select" value={resumeId} onChange={(e) => setResumeId(e.target.value)}>
                  <option value="">No resume</option>
                  {resumes.map((resume) => (
                    <option key={resume.id} value={resume.id}>{resume.fileName || `Resume ${resume.id}`}</option>
                  ))}
                </select>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <label className="st-label" htmlFor="brief-count">Questions · {count}</label>
              <input
                id="brief-count"
                type="range"
                min="3"
                max="20"
                step="1"
                value={count}
                onChange={(e) => setCount(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--st-accent)' }}
              />
              <div className="st-between st-dim" style={{ fontSize: 11.5 }}>
                <span>3 · quick check</span>
                <span>20 · full loop</span>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <label className="st-label" htmlFor="brief-title">Session title</label>
              <input id="brief-title" className="st-input" value={title} onChange={(e) => setTitle(e.target.value)} maxLength={200} />
            </div>

            <div style={{ marginTop: 14 }}>
              <label className="st-label" htmlFor="brief-notes">What should it probe? (optional)</label>
              <textarea
                id="brief-notes"
                className="st-textarea"
                rows={3}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="e.g. system design trade-offs, SQL indexing, incident stories"
                maxLength={2000}
              />
            </div>
          </section>

          {error && <div className="st-banner st-banner-bad">{error}</div>}
        </div>

        <aside className="st-card" style={{ position: 'sticky', top: 84 }}>
          <p className="st-eyebrow" style={{ margin: 0 }}>Session blueprint</p>
          <h2 className="st-h2" style={{ margin: '6px 0 14px' }}>{selected?.title || 'Select a role'}</h2>

          <div className="st-stack" style={{ gap: 10 }}>
            <div className="st-between" style={{ fontSize: 13 }}>
              <span className="st-dim">Difficulty</span>
              <span className="st-row" style={{ gap: 4 }}>
                {TIERS.map((label, index) => (
                  <span
                    key={label}
                    className={index === tier ? 'st-chip st-chip-accent' : 'st-chip'}
                    style={{ opacity: index === tier ? 1 : 0.45 }}
                  >{label}</span>
                ))}
              </span>
            </div>
            <div className="st-between" style={{ fontSize: 13 }}><span className="st-dim">Questions</span><strong>{count}</strong></div>
            <div className="st-between" style={{ fontSize: 13 }}><span className="st-dim">Answers</span><strong>{mode === 'VOICE' ? 'Voice + text' : 'Text'}</strong></div>
            <div className="st-between" style={{ fontSize: 13 }}><span className="st-dim">Est. time</span><strong>{minutes} min</strong></div>
            <div className="st-between" style={{ fontSize: 13 }}><span className="st-dim">Scoring</span><strong>5-criterion rubric</strong></div>
          </div>

          <div className="st-banner" style={{ marginTop: 16, fontSize: 12 }}>
            <Sparkles size={14} style={{ flexShrink: 0, marginTop: 1, color: 'var(--st-accent)' }} />
            <span>Questions are chosen from the role and your resume. Follow-ups adapt to each answer.</span>
          </div>

          <button
            type="button"
            className="st-btn st-btn-primary st-btn-lg"
            style={{ width: '100%', marginTop: 16 }}
            disabled={!jobId || starting}
            onClick={start}
          >
            {starting ? 'Preparing…' : 'Start session'} <ArrowRight size={16} />
          </button>
          <p className="st-dim" style={{ fontSize: 11.5, margin: '10px 0 0', lineHeight: 1.5 }}>
            The difficulty tier is set on the job description, so the rubric and the question bank agree.
          </p>
        </aside>
      </div>
      </Reveal>
    </div>
  )
}
