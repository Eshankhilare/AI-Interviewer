import React from 'react'
import { cleanup, render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { afterEach, describe, expect, it } from 'vitest'
import ResumeDocument from './ResumeDocument'
import { buildLocalResume, emptyResumeDraft } from '../../utils/resumeDraft'

const draft = {
  ...emptyResumeDraft({ fullName: 'Ada Lovelace', email: 'ada@example.com' }),
  role: 'Backend Developer',
  skills: 'Java, SQL',
  experience: [{ title: 'Backend Engineer', company: 'Analytical Engines', period: '2023', description: 'Built APIs.' }],
}

afterEach(cleanup)

describe('ResumeDocument', () => {
  it.each(['classic', 'modern', 'minimal', 'sidebar', 'technical'])(
    'renders the %s template with the candidate name and role',
    (template) => {
      render(<ResumeDocument resume={buildLocalResume(draft)} draft={draft} template={template} />)
      expect(screen.getByRole('heading', { name: 'Ada Lovelace' })).toBeInTheDocument()
      expect(screen.getAllByText(/Backend Developer/).length).toBeGreaterThan(0)
      expect(screen.getAllByText(/Analytical Engines/).length).toBeGreaterThan(0)
    },
  )
})
