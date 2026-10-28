import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Download, Plus, Save, Sparkles, Trash2 } from 'lucide-react'
import api, { errorMessage } from '../services/api'
import { useAuth } from '../context/AuthContext'
import ResumeDocument from '../components/resume/ResumeDocument'
import {
  EMPTY_EDUCATION, EMPTY_EXPERIENCE, EMPTY_PROJECT, RESUME_TEMPLATES,
  buildLocalResume, draftToPayload, emptyResumeDraft, mergeGeneratedResume, resumeToText,
} from '../utils/resumeDraft'
import '../v2/ui.css'

const Field = ({ label, children }) => (
  <label className="st-label" style={{ display: 'block', marginBottom: 12 }}>
    {label}
    {children}
  </label>
)

const ResumeBuilder = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [draft, setDraft] = useState(() => emptyResumeDraft(user))
  const [template, setTemplate] = useState('classic')
  const [aiResume, setAiResume] = useState(null)
  const [generating, setGenerating] = useState(false)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const localResume = useMemo(() => buildLocalResume(draft), [draft])
  const resume = aiResume || localResume

  const change = (field, value) => {
    setDraft((current) => ({ ...current, [field]: value }))
    setAiResume(null)
    setSuccess('')
  }

  const changeItem = (kind, index, field, value) => {
    setDraft((current) => ({
      ...current,
      [kind]: current[kind].map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    }))
    setAiResume(null)
    setSuccess('')
  }

  const addItem = (kind, empty) => {
    setDraft((current) => ({ ...current, [kind]: [...current[kind], { ...empty }] }))
    setAiResume(null)
  }

  const removeItem = (kind, index) => {
    setDraft((current) => ({
      ...current,
      [kind]: current[kind].length > 1 ? current[kind].filter((_, i) => i !== index) : [{ ...(kind === 'experience' ? EMPTY_EXPERIENCE : kind === 'education' ? EMPTY_EDUCATION : EMPTY_PROJECT) }],
    }))
    setAiResume(null)
  }

  const generate = async () => {
    if (!draft.fullName.trim() || !draft.role.trim()) {
      setError('Add your name and target role first.')
      return
    }
    setGenerating(true)
    setError('')
    setSuccess('')
    try {
      const { data } = await api.post('/resumes/generate', draftToPayload(draft))
      setAiResume(mergeGeneratedResume(localResume, data))
      if (data.mode === 'ai') {
        setSuccess('Resume drafted. Review the preview, then download or save it.')
      } else {
        setSuccess('')
        setError('AI is unavailable or the quota is exhausted, so the offline template was used. Your facts are unchanged; download or save it normally.')
      }
    } catch (err) {
      setAiResume(localResume)
      setError(`${errorMessage(err, 'AI generation is unavailable.')} The offline template was used instead; your facts were not changed.`)
    } finally {
      setGenerating(false)
    }
  }

  const saveToLibrary = async () => {
    if (!draft.fullName.trim()) {
      setError('Add your name before saving.')
      return
    }
    setSaving(true)
    setError('')
    setSuccess('')
    try {
      await api.post('/resumes/parse-text', {
        text: resumeToText(resume, draft),
        fileName: `${draft.fullName.trim().replace(/[^A-Za-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'resume'}-${template}.txt`,
      })
      setSuccess('Saved to your Resumes library.')
    } catch (err) {
      setError(errorMessage(err, 'Could not save this resume.'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="st-content" style={{ maxWidth: 1240 }}>
      <div className="st-between" style={{ alignItems: 'flex-start', gap: 16, flexWrap: 'wrap' }}>
        <div>
          <Link to="/resumes" className="st-dim" style={{ fontSize: 12, display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={14} /> Back to library
          </Link>
          <p className="st-eyebrow" style={{ marginTop: 18 }}>Resume builder</p>
          <h1 className="st-display" style={{ marginTop: 6 }}>Build it once. Make it yours.</h1>
          <p className="st-sub" style={{ maxWidth: 620 }}>
            Enter the facts. The AI writes the sentences and picks a template. It never invents
            employers, dates or degrees.
          </p>
        </div>
        <span className={`st-chip ${resume.mode === 'ai' ? 'st-chip-ok' : ''}`}>
          {resume.mode === 'ai' ? 'AI-written' : 'Offline template'}
        </span>
      </div>

      {error && <div className="st-banner st-banner-bad" style={{ marginTop: 18 }}>{error}</div>}
      {success && <div className="st-banner" style={{ marginTop: 18, color: '#86efac', borderColor: 'rgba(74,222,128,.28)', background: 'rgba(74,222,128,.08)' }}>{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,.95fr)_minmax(0,1.05fr)] gap-5 mt-6 items-start">
        <div className="st-card" style={{ padding: 22 }}>
          <h2 className="st-h2">1. Your details</h2>
          <div className="st-grid-2" style={{ marginTop: 14 }}>
            <Field label="Full name"><input className="st-input" value={draft.fullName} onChange={(e) => change('fullName', e.target.value)} placeholder="Ada Lovelace" /></Field>
            <Field label="Target role"><input className="st-input" value={draft.role} onChange={(e) => change('role', e.target.value)} placeholder="Backend Developer" /></Field>
            <Field label="Email"><input className="st-input" type="email" value={draft.email} onChange={(e) => change('email', e.target.value)} placeholder="you@example.com" /></Field>
            <Field label="Phone"><input className="st-input" value={draft.phone} onChange={(e) => change('phone', e.target.value)} placeholder="+91 98765 43210" /></Field>
            <Field label="Location"><input className="st-input" value={draft.location} onChange={(e) => change('location', e.target.value)} placeholder="Pune, India" /></Field>
            <Field label="LinkedIn"><input className="st-input" value={draft.linkedin} onChange={(e) => change('linkedin', e.target.value)} placeholder="linkedin.com/in/..." /></Field>
            <Field label="GitHub / portfolio"><input className="st-input" value={draft.github} onChange={(e) => change('github', e.target.value)} placeholder="github.com/..." /></Field>
          </div>
          <Field label="Summary (optional — AI writes one if empty)">
            <textarea className="st-textarea" rows={3} value={draft.summary} onChange={(e) => change('summary', e.target.value)} placeholder="A sentence about the work you want to do." />
          </Field>
          <Field label="Skills (comma separated)">
            <input className="st-input" value={draft.skills} onChange={(e) => change('skills', e.target.value)} placeholder="Java, Spring Boot, SQL, Redis" />
          </Field>

          <div className="st-between" style={{ marginTop: 22 }}>
            <h2 className="st-h2">2. Experience</h2>
            <button type="button" className="st-btn st-btn-sm st-btn-ghost" onClick={() => addItem('experience', EMPTY_EXPERIENCE)}><Plus size={13} /> Add</button>
          </div>
          {draft.experience.map((item, index) => (
            <div key={index} className="st-card" style={{ padding: 14, marginTop: 10, background: 'rgba(255,255,255,.02)' }}>
              <div className="st-between" style={{ marginBottom: 8 }}>
                <span className="st-dim" style={{ fontSize: 11 }}>Role {index + 1}</span>
                <button type="button" className="st-btn st-btn-sm st-btn-ghost" aria-label="Remove experience" onClick={() => removeItem('experience', index)}><Trash2 size={13} /></button>
              </div>
              <div className="st-grid-2">
                <Field label="Title"><input className="st-input" value={item.title} onChange={(e) => changeItem('experience', index, 'title', e.target.value)} placeholder="Backend Engineer" /></Field>
                <Field label="Company"><input className="st-input" value={item.company} onChange={(e) => changeItem('experience', index, 'company', e.target.value)} placeholder="Acme" /></Field>
                <Field label="Period"><input className="st-input" value={item.period} onChange={(e) => changeItem('experience', index, 'period', e.target.value)} placeholder="2023 – 2025" /></Field>
              </div>
              <Field label="What you did (one fact per line)">
                <textarea className="st-textarea" rows={3} value={item.description} onChange={(e) => changeItem('experience', index, 'description', e.target.value)} placeholder="Built REST APIs in Spring Boot." />
              </Field>
            </div>
          ))}

          <div className="st-between" style={{ marginTop: 22 }}>
            <h2 className="st-h2">3. Education</h2>
            <button type="button" className="st-btn st-btn-sm st-btn-ghost" onClick={() => addItem('education', EMPTY_EDUCATION)}><Plus size={13} /> Add</button>
          </div>
          {draft.education.map((item, index) => (
            <div key={index} className="st-card" style={{ padding: 14, marginTop: 10, background: 'rgba(255,255,255,.02)' }}>
              <div className="st-between" style={{ marginBottom: 8 }}>
                <span className="st-dim" style={{ fontSize: 11 }}>Education {index + 1}</span>
                <button type="button" className="st-btn st-btn-sm st-btn-ghost" aria-label="Remove education" onClick={() => removeItem('education', index)}><Trash2 size={13} /></button>
              </div>
              <div className="st-grid-2">
                <Field label="Degree"><input className="st-input" value={item.degree} onChange={(e) => changeItem('education', index, 'degree', e.target.value)} placeholder="B.Tech Computer Science" /></Field>
                <Field label="School"><input className="st-input" value={item.school} onChange={(e) => changeItem('education', index, 'school', e.target.value)} placeholder="SCE" /></Field>
                <Field label="Period"><input className="st-input" value={item.period} onChange={(e) => changeItem('education', index, 'period', e.target.value)} placeholder="2019 – 2023" /></Field>
              </div>
            </div>
          ))}

          <div className="st-between" style={{ marginTop: 22 }}>
            <h2 className="st-h2">4. Projects (optional)</h2>
            <button type="button" className="st-btn st-btn-sm st-btn-ghost" onClick={() => addItem('projects', EMPTY_PROJECT)}><Plus size={13} /> Add</button>
          </div>
          {draft.projects.map((item, index) => (
            <div key={index} className="st-card" style={{ padding: 14, marginTop: 10, background: 'rgba(255,255,255,.02)' }}>
              <div className="st-between" style={{ marginBottom: 8 }}>
                <span className="st-dim" style={{ fontSize: 11 }}>Project {index + 1}</span>
                <button type="button" className="st-btn st-btn-sm st-btn-ghost" aria-label="Remove project" onClick={() => removeItem('projects', index)}><Trash2 size={13} /></button>
              </div>
              <Field label="Name"><input className="st-input" value={item.name} onChange={(e) => changeItem('projects', index, 'name', e.target.value)} placeholder="Interview practice app" /></Field>
              <Field label="One line"><input className="st-input" value={item.detail} onChange={(e) => changeItem('projects', index, 'detail', e.target.value)} placeholder="React + Spring Boot; rubric-scored reports." /></Field>
            </div>
          ))}
        </div>

        <div className="lg:sticky lg:top-5">
          <div className="st-card" style={{ padding: 16 }}>
            <div className="st-between" style={{ marginBottom: 10 }}>
              <h2 className="st-h2" style={{ margin: 0 }}>Template</h2>
              <span className="st-dim" style={{ fontSize: 11 }}>5 layouts</span>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {RESUME_TEMPLATES.map((option) => (
                <button
                  key={option.id}
                  type="button"
                  className={`st-btn st-btn-sm${template === option.id ? ' st-btn-primary' : ' st-btn-ghost'}`}
                  onClick={() => setTemplate(option.id)}
                  title={option.blurb}
                >
                  {option.name}
                </button>
              ))}
            </div>
            <div className="st-row" style={{ marginTop: 12, flexWrap: 'wrap' }}>
              <button type="button" className="st-btn st-btn-primary st-btn-sm" onClick={generate} disabled={generating}>
                <Sparkles size={14} /> {generating ? 'Writing…' : 'Generate with AI'}
              </button>
              <button type="button" className="st-btn st-btn-sm" onClick={() => window.print()}>
                <Download size={14} /> Download PDF
              </button>
              <button type="button" className="st-btn st-btn-sm st-btn-ghost" onClick={saveToLibrary} disabled={saving}>
                <Save size={14} /> {saving ? 'Saving…' : 'Save to library'}
              </button>
            </div>
            <p className="st-dim" style={{ fontSize: 11, marginTop: 8 }}>
              Download opens the print dialog — choose <strong>Save as PDF</strong>. AI rewrites only the facts above.
            </p>
          </div>

          <div className="rs-preview" style={{ marginTop: 12 }}>
            <ResumeDocument resume={resume} draft={draft} template={template} />
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResumeBuilder
