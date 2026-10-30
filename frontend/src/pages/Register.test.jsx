import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { registerMock } = vi.hoisted(() => ({ registerMock: vi.fn() }))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ register: registerMock }),
}))

vi.mock('../components/auth/GoogleButton', () => ({
  default: () => null,
}))

import Register from './Register'

const fillAndSubmit = (container) => {
  fireEvent.change(screen.getByPlaceholderText('John Doe'), { target: { value: 'Ada Lovelace' } })
  fireEvent.change(screen.getByPlaceholderText('you@example.com'), { target: { value: 'ada@example.com' } })
  fireEvent.change(screen.getByPlaceholderText('At least 8 characters'), { target: { value: 'secret123' } })
  const form = container.querySelector('form')
  fireEvent.submit(form)
  return form
}

describe('Register', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn()
    registerMock.mockReset()
  })

  afterEach(() => {
    cleanup()
  })

  it('does not mount a second background video', () => {
    render(<MemoryRouter><Register /></MemoryRouter>)
    expect(document.querySelectorAll('video')).toHaveLength(0)
  })

  it('ignores a second submit while the first request is in flight', () => {
    registerMock.mockReturnValue(new Promise(() => {}))
    const { container } = render(<MemoryRouter><Register /></MemoryRouter>)

    const form = fillAndSubmit(container)
    fireEvent.submit(form)

    expect(registerMock).toHaveBeenCalledTimes(1)
    expect(registerMock).toHaveBeenCalledWith(expect.objectContaining({
      fullName: 'Ada Lovelace',
      email: 'ada@example.com',
      password: 'secret123',
    }))
    expect(screen.getByRole('button', { name: /creating account/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /creating account/i })).toHaveAttribute('aria-busy', 'true')
  })

  it('shows the server message for a rejected registration', async () => {
    registerMock.mockRejectedValue({ response: { status: 409, data: { message: 'Email already exists' } } })
    const { container } = render(<MemoryRouter><Register /></MemoryRouter>)

    fillAndSubmit(container)

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Email already exists'))
    expect(screen.getByRole('button', { name: /create account/i })).not.toBeDisabled()
  })
})
