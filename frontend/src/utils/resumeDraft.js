export const RESUME_TEMPLATES = [
  { id: 'classic', name: 'Classic', blurb: 'Centered, serif, traditional' },
  { id: 'modern', name: 'Modern', blurb: 'Bold header, two columns' },
  { id: 'minimal', name: 'Minimal', blurb: 'Whitespace and small caps' },
  { id: 'sidebar', name: 'Sidebar', blurb: 'Dark rail, skills first' },
  { id: 'technical', name: 'Technical', blurb: 'Compact, monospace accents' },
]

export const EMPTY_EXPERIENCE = { title: '', company: '', period: '', description: '' }
export const EMPTY_EDUCATION = { degree: '', school: '', period: '' }
export const EMPTY_PROJECT = { name: '', detail: '' }

export const emptyResumeDraft = (user = {}) => ({
  fullName: user.fullName || '',
  role: '',
  email: user.email || '',
  phone: user.phone || '',
  location: '',
  linkedin: '',
  github: '',
  summary: '',
  skills: '',
  experience: [{ ...EMPTY_EXPERIENCE }],
  education: [{ ...EMPTY_EDUCATION }],
  projects: [],
})

export function normalizeSkills(value) {
  const seen = new Set()
  return String(value || '')
    .split(/[,;\n]/)
    .map((part) => part.trim())
    .filter((part) => {
      const key = part.toLowerCase()
      if (!part || seen.has(key)) return false
      seen.add(key)
      return true
    })
    .slice(0, 20)
}

const splitBullets = (description) => String(description || '')
  .split(/\r?\n|(?<=[.!?])\s+/)
  .map((part) => part.replace(/^[-*•]\s*/, '').trim())
  .filter(Boolean)
  .slice(0, 4)

export function buildLocalResume(draft) {
  const skills = normalizeSkills(draft.skills)
  const role = String(draft.role || '').trim() || 'Professional'
  const summary = String(draft.summary || '').trim()
    || (skills.length
      ? `${role} focused on ${skills.slice(0, 4).join(', ')}.`
      : `${role} focused on delivering reliable, user-focused work.`)

  return {
    summary,
    skills,
    experience: (draft.experience || [])
      .filter((item) => item.title || item.company || item.description)
      .map((item) => ({
        title: String(item.title || '').trim(),
        company: String(item.company || '').trim(),
        period: String(item.period || '').trim(),
        bullets: splitBullets(item.description),
      })),
    education: (draft.education || [])
      .filter((item) => item.degree || item.school)
      .map((item) => ({
        degree: String(item.degree || '').trim(),
        school: String(item.school || '').trim(),
        period: String(item.period || '').trim(),
      })),
    projects: (draft.projects || [])
      .filter((item) => item.name || item.detail)
      .map((item) => ({
        name: String(item.name || '').trim(),
        detail: String(item.detail || '').trim(),
      })),
    mode: 'template',
  }
}

/** Keep the identity/contact from the form; take only rewritten prose from AI. */
export function mergeGeneratedResume(local, generated) {
  if (!generated || typeof generated !== 'object') return local
  const experience = local.experience.map((item, index) => {
    const bullets = generated.experience?.[index]?.bullets
    return Array.isArray(bullets) && bullets.length
      ? { ...item, bullets: bullets.map((b) => String(b).trim()).filter(Boolean).slice(0, 4) }
      : item
  })
  return {
    ...local,
    summary: String(generated.summary || '').trim() || local.summary,
    skills: Array.isArray(generated.skills) && generated.skills.length
      ? generated.skills.map((s) => String(s).trim()).filter(Boolean).slice(0, 20)
      : local.skills,
    experience,
    mode: generated.mode === 'ai' ? 'ai' : 'template',
  }
}

export function draftToPayload(draft) {
  return {
    full_name: String(draft.fullName || '').trim(),
    role: String(draft.role || '').trim(),
    email: String(draft.email || '').trim(),
    phone: String(draft.phone || '').trim(),
    location: String(draft.location || '').trim(),
    linkedin: String(draft.linkedin || '').trim(),
    github: String(draft.github || '').trim(),
    summary: String(draft.summary || '').trim(),
    skills: String(draft.skills || '').trim(),
    experience: (draft.experience || []).filter((item) => item.title || item.company || item.description),
    education: (draft.education || []).filter((item) => item.degree || item.school),
    projects: (draft.projects || []).filter((item) => item.name || item.detail),
  }
}

export function resumeToText(resume, draft) {
  const lines = [
    draft.fullName,
    draft.role,
    [draft.email, draft.phone, draft.location, draft.linkedin, draft.github].filter(Boolean).join(' | '),
    '',
    'SUMMARY',
    resume.summary,
    '',
  ]
  if (resume.experience.length) {
    lines.push('EXPERIENCE')
    for (const item of resume.experience) {
      lines.push(`${item.title}${item.company ? ` — ${item.company}` : ''}${item.period ? ` (${item.period})` : ''}`)
      for (const bullet of item.bullets) lines.push(`- ${bullet}`)
      lines.push('')
    }
  }
  if (resume.education.length) {
    lines.push('EDUCATION')
    for (const item of resume.education) {
      lines.push([item.degree, item.school, item.period].filter(Boolean).join(' — '))
    }
    lines.push('')
  }
  if (resume.skills.length) {
    lines.push('SKILLS')
    lines.push(resume.skills.join(', '))
    lines.push('')
  }
  if (resume.projects.length) {
    lines.push('PROJECTS')
    for (const item of resume.projects) lines.push(`${item.name}: ${item.detail}`)
  }
  return lines.filter((line) => line !== undefined).join('\n').trim()
}
