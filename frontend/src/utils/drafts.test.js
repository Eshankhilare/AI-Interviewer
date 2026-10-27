import { describe, expect, it, vi, beforeEach } from 'vitest'
import { clearDraft, draftKey, loadDraft, saveDraft } from './drafts'

const user = { email: 'ada@example.com' }

beforeEach(() => {
  const store = new Map()
  vi.stubGlobal('localStorage', {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
  })
})

describe('answer drafts', () => {
  it('round-trips an unsent answer per user and question', () => {
    expect(saveDraft(user, 4, 12, 'half-written answer')).toBe(true)
    expect(loadDraft(user, 4, 12)).toBe('half-written answer')
    expect(loadDraft(user, 4, 13)).toBe('')
    expect(loadDraft({ email: 'other@example.com' }, 4, 12)).toBe('')
  })

  it('clears the draft after a successful submit', () => {
    saveDraft(user, 4, 12, 'text')
    clearDraft(user, 4, 12)
    expect(loadDraft(user, 4, 12)).toBe('')
  })

  it('does not store blank whitespace', () => {
    expect(saveDraft(user, 4, 12, '   ')).toBe(false)
    expect(loadDraft(user, 4, 12)).toBe('')
  })

  it('namespaces the key by user, interview and question', () => {
    expect(draftKey(user, 4, 12)).toContain('ada@example.com')
    expect(draftKey(user, 4, 12)).toContain(':4:12')
  })
})
