// Draft answers survive a refresh or a crash. Stored per user/interview/question
// in localStorage because the backend already keeps the submitted answer; this
// is only the unsent text.

const PREFIX = 'interviewer-draft-v1'

const storage = () => (typeof localStorage === 'undefined' ? null : localStorage)

export const draftKey = (user, interviewId, questionId) => (
  `${PREFIX}:${user?.email || user?.id || 'local'}:${interviewId}:${questionId}`
)

export const loadDraft = (user, interviewId, questionId) => {
  try {
    return storage()?.getItem(draftKey(user, interviewId, questionId)) || ''
  } catch {
    return ''
  }
}

export const saveDraft = (user, interviewId, questionId, text) => {
  try {
    const value = String(text || '')
    if (!value.trim()) return false
    storage()?.setItem(draftKey(user, interviewId, questionId), value)
    return true
  } catch {
    return false
  }
}

export const clearDraft = (user, interviewId, questionId) => {
  try {
    storage()?.removeItem(draftKey(user, interviewId, questionId))
    return true
  } catch {
    return false
  }
}
