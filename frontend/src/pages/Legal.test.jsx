import React from 'react'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import { describe, expect, it } from 'vitest'
import { Privacy, Terms, Cookies } from './Legal'

const renderPage = (element) => render(<MemoryRouter>{element}</MemoryRouter>)

describe('legal pages', () => {
  it('renders the privacy policy with a contact route', () => {
    renderPage(<Privacy />)
    expect(screen.getByRole('heading', { name: 'Privacy Policy' })).toBeInTheDocument()
    expect(screen.getByText(/what we collect/i)).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute('href', '/terms')
  })

  it('renders the terms and the AI-output disclaimer', () => {
    renderPage(<Terms />)
    expect(screen.getByRole('heading', { name: 'Terms of Service' })).toBeInTheDocument()
    expect(screen.getByText(/Scores, feedback and sample answers are generated automatically/i)).toBeInTheDocument()
  })

  it('renders the cookie policy and lists the stored keys', () => {
    renderPage(<Cookies />)
    expect(screen.getByRole('heading', { name: 'Cookie Policy' })).toBeInTheDocument()
    expect(screen.getByText('token')).toBeInTheDocument()
    expect(screen.getByText('ui-version')).toBeInTheDocument()
  })
})
