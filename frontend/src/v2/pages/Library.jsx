import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Briefcase, FileText, Plus, Sparkles, Trash2 } from 'lucide-react'
import api, { errorMessage } from '../../services/api'
import { JOB_ROLES } from '../../data/jobRoles'
import { Empty, PageHead, SkeletonBlock } from '../ui'

const LEVELS = ['JUNIOR', 'MID', 'SENIOR']

export default function Library({ initialTab = 'jobs' }) {
  const navigate = useNavigate()
  const [tab, setTab] = useState(initialTab)
  const [jobs, setJobs] = useState(null)
  const [resumes, setResumes] = useState([])
  const [error, setError] = useState('')
  const [busy, setBusy] = useState(false)
  const [catalogBusy, setCatalogBusy] = useState(false)
  const [showJobForm, setShowJobForm] = useState(false)
  const [showResumeForm, setShowResumeForm] = useState(false)
  const [job, setJob] = useState({ title: '', company: '', description: '', experienceLevel: 'MID' })
  const [resumeText, setResumeText] = useState('')

  const load = () => Promise.all([
    api.get('/job-descriptions').catch(() => ({ data: [] })),
    api.get('/resumes').catch(() => ({ data: [] })),
  ]).then(([jobRes, resumeRes]) => {
    setJobs(jobRes.data)
    setResumes(resumeRes.data)
  })

  useEffect(() => {
    load()
  }, [])

  const createJob = async (event) => {
    event.preventDefault()
    if (!job.title.trim() || !job.description.trim() || busy) return
    setBusy(true)
    setError('')
    try {
      await api.post('/job-descriptions', {
        ...job,
        company: job.company.trim() || 'Self',
        experienceLevel: job.experienceLevel,
        location: '',
        employmentType: 'Full-time',
      })
      setJob({ title: '', company: '', description: '', experienceLevel: 'MID' })
      setShowJobForm(false)
      await load()
    } catch (err) {
      setError(errorMessage(err, 'Could not save the job description.'))
    } finally {
      setBusy(false)
    }
  }

  const createResume = async (event) => {
    event.preventDefault()
    if (!resumeText.trim() || busy) return
    setBusy(true)
    setError('')
    try {
      await api.post('/resumes/parse-text', { text: resumeText })
      setResumeText('')
      setShowResumeForm(false)
      await load()
    } catch (err) {
      setError(errorMessage(err, 'Could not parse the resume text.'))
    } finally {
      setBusy(false)
    }
  }

  const startFromRole = async (role) => {
    if (catalogBusy) return
    const existing = (jobs || []).find(
      (item) => item.title.toLowerCase() === role.title.toLowerCase())
    if (existing) {
      navigate(`/interview/new?job=${existing.id}`)
      return
    }
    setCatalogBusy(true)
    setError('')
    try {
      const { data } = await api.post('/job-descriptions', {
        title: role.title,
        company: 'Self',
        description: role.description,
        experienceLevel: 'MID',
        location: '',
        employmentType: 'Full-time',
      })
      await load()
      navigate(`/interview/new?job=${data.id}`)
    } catch (err) {
      setError(errorMessage(err, 'Could not start from this role.'))
    } finally {
      setCatalogBusy(false)
    }
  }

  const remove = async (kind, id) => {    if (busy) return
    setBusy(true)
    setError('')
    try {
      await api.delete(`/${kind}/${id}`)
      await load()
    } catch (err) {
      setError(errorMessage(err, 'Could not delete this item.'))
    } finally {
      setBusy(false)
    }
  }

  if (jobs === null) {
    return (
      <div className="st-content st-narrow">
        <SkeletonBlock height={36} width={220} />
        <div style={{ height: 18 }} />
        <SkeletonBlock height={260} />
      </div>
    )
  }

  return (
    <div className="st-content st-narrow">
      <PageHead
        eyebrow="Library"
        title="Roles and resumes"
        sub="Everything the studio draws on. Roles set the difficulty tier; resumes personalise the questions."
        actions={
          tab === 'jobs' ? (
            <button
              type="button"
              className="st-btn st-btn-primary"
              onClick={() => setShowJobForm((v) => !v)}
            >
              <Plus size={15} /> New role
            </button>
          ) : (
            <div className="st-row">
              <button type="button" className="st-btn st-btn-ghost" onClick={() => navigate('/resume-builder')}>
                <Sparkles size={14} /> Build with AI
              </button>
              <button type="button" className="st-btn st-btn-primary" onClick={() => setShowResumeForm((v) => !v)}>
                <Plus size={15} /> Add resume
              </button>
            </div>
          )
        }
      />

      <div className="st-row" style={{ marginBottom: 18 }}>
        <div className="st-tabs">
          <button type="button" className={`st-tab${tab === 'jobs' ? ' is-active' : ''}`} onClick={() => setTab('jobs')}>
            <Briefcase size={13} style={{ marginRight: 5, verticalAlign: '-2px' }} /> Roles ({jobs.length})
          </button>
          <button type="button" className={`st-tab${tab === 'resumes' ? ' is-active' : ''}`} onClick={() => setTab('resumes')}>
            <FileText size={13} style={{ marginRight: 5, verticalAlign: '-2px' }} /> Resumes ({resumes.length})
          </button>
        </div>
      </div>

      {error && <div className="st-banner st-banner-bad" style={{ marginBottom: 14 }}>{error}</div>}

      {tab === 'jobs' && (
        <>
          <div className="st-card" style={{ padding: 18, marginBottom: 16 }}>
            <div className="st-between">
              <h2 className="st-h2" style={{ margin: 0 }}>Start from a role</h2>
              <span className="st-dim" style={{ fontSize: 11 }}>{JOB_ROLES.length} templates</span>
            </div>
            <p className="st-dim" style={{ fontSize: 12, margin: '5px 0 12px' }}>
              Pick a role to create it and open the brief. Your own role form is still below.
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(205px, 1fr))', gap: 7, maxHeight: 232, overflowY: 'auto' }}>
              {JOB_ROLES.map((role) => (
                <button
                  key={role.title}
                  type="button"
                  className="st-btn st-btn-sm st-btn-ghost"
                  disabled={catalogBusy}
                  onClick={() => startFromRole(role)}
                  style={{ width: '100%', justifyContent: 'space-between', textAlign: 'left' }}
                >
                  <span>{role.title}</span>
                  <span className="st-dim" style={{ fontSize: 9.5 }}>{role.category}</span>
                </button>
              ))}
            </div>
          </div>

          {showJobForm && (
            <form className="st-card" onSubmit={createJob} style={{ marginBottom: 16 }}>
              <h2 className="st-h2">New role</h2>
              <div className="st-grid-2" style={{ marginTop: 14 }}>
                <div>
                  <label className="st-label" htmlFor="lib-job-title">Title</label>
                  <input id="lib-job-title" className="st-input" value={job.title}
                    onChange={(e) => setJob({ ...job, title: e.target.value })} placeholder="Backend Developer" required />
                </div>
                <div>
                  <label className="st-label" htmlFor="lib-job-company">Company</label>
                  <input id="lib-job-company" className="st-input" value={job.company}
                    onChange={(e) => setJob({ ...job, company: e.target.value })} placeholder="Acme" />
                </div>
              </div>
              <div style={{ marginTop: 12 }}>
                <label className="st-label" htmlFor="lib-job-desc">Job description</label>
                <textarea id="lib-job-desc" className="st-textarea" rows={5} value={job.description}
                  onChange={(e) => setJob({ ...job, description: e.target.value })}
                  placeholder="Paste the responsibilities, stack and seniority signals." required />
              </div>
              <div className="st-between" style={{ marginTop: 14 }}>
                <div>
                  <label className="st-label" htmlFor="lib-job-level">Tier</label>
                  <select id="lib-job-level" className="st-select" value={job.experienceLevel}
                    onChange={(e) => setJob({ ...job, experienceLevel: e.target.value })} style={{ width: 180 }}>
                    {LEVELS.map((level) => <option key={level} value={level}>{level}</option>)}
                  </select>
                </div>
                <div className="st-row">
                  <button type="button" className="st-btn st-btn-ghost" onClick={() => setShowJobForm(false)}>Cancel</button>
                  <button type="submit" className="st-btn st-btn-primary" disabled={busy}>{busy ? 'Saving…' : 'Save role'}</button>
                </div>
              </div>
            </form>
          )}

          <div className="st-card" style={{ padding: '6px 22px' }}>
            {jobs.length ? jobs.map((item) => (
              <div className="st-list-item" key={item.id}>
                <div style={{ minWidth: 0 }}>
                  <strong style={{ fontSize: 14 }}>{item.title}</strong>
                  <p className="st-dim" style={{ margin: '3px 0 0', fontSize: 12 }}>
                    {[item.company, item.experienceLevel, item.location].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <div className="st-row" style={{ gap: 8 }}>
                  <button type="button" className="st-btn st-btn-sm" onClick={() => navigate(`/interview/new?job=${item.id}`)}>Use</button>
                  <button type="button" className="st-btn st-btn-sm st-btn-ghost" aria-label={`Delete ${item.title}`}
                    onClick={() => remove('job-descriptions', item.id)}>
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            )) : (
              <Empty icon={Briefcase} title="No roles yet"
                action={<button type="button" className="st-btn st-btn-sm" onClick={() => setShowJobForm(true)}>Add the first role</button>}>
                A role is the source of questions, tier and rubric.
              </Empty>
            )}
          </div>
        </>
      )}

      {tab === 'resumes' && (
        <>
          {showResumeForm && (
            <form className="st-card" onSubmit={createResume} style={{ marginBottom: 16 }}>
              <h2 className="st-h2">Paste a resume</h2>
              <p className="st-dim" style={{ fontSize: 12, margin: '6px 0 12px' }}>
                Text only. PDF and DOCX parsing is not available yet.
              </p>
              <label className="st-label" htmlFor="lib-resume">Resume text</label>
              <textarea id="lib-resume" className="st-textarea" rows={8} value={resumeText}
                onChange={(e) => setResumeText(e.target.value)} placeholder="Paste the resume content here…" required />
              <div className="st-row" style={{ marginTop: 12, justifyContent: 'flex-end' }}>
                <button type="button" className="st-btn st-btn-ghost" onClick={() => setShowResumeForm(false)}>Cancel</button>
                <button type="submit" className="st-btn st-btn-primary" disabled={busy}>{busy ? 'Parsing…' : 'Parse resume'}</button>
              </div>
            </form>
          )}

          <div className="st-card" style={{ padding: '6px 22px' }}>
            {resumes.length ? resumes.map((item) => (
              <div className="st-list-item" key={item.id}>
                <div style={{ minWidth: 0 }}>
                  <strong style={{ fontSize: 14 }}>{item.fileName || `Resume ${item.id}`}</strong>
                  <p className="st-dim" style={{ margin: '3px 0 0', fontSize: 12 }}>
                    {[item.status, item.createdAt ? new Date(item.createdAt).toLocaleDateString() : null].filter(Boolean).join(' · ')}
                  </p>
                </div>
                <button type="button" className="st-btn st-btn-sm st-btn-ghost" aria-label={`Delete ${item.fileName || item.id}`}
                  onClick={() => remove('resumes', item.id)}>
                  <Trash2 size={14} />
                </button>
              </div>
            )) : (
              <Empty icon={FileText} title="No resumes yet"
                action={<div className="st-row"><button type="button" className="st-btn st-btn-sm" onClick={() => setShowResumeForm(true)}>Paste one</button><button type="button" className="st-btn st-btn-sm st-btn-ghost" onClick={() => navigate('/resume-builder')}><Sparkles size={13} /> Build with AI</button></div>}>
                Attach a resume to get questions about your actual work.
              </Empty>
            )}
          </div>
        </>
      )}

      <p className="st-dim" style={{ fontSize: 12, marginTop: 16 }}>
        Need the old management screens? <Link to="/job-descriptions?ui=classic" className="st-dim">Open the classic library</Link>.
      </p>
    </div>
  )
}

