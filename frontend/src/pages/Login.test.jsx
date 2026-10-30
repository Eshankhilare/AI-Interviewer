import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { MemoryRouter } from 'react-router-dom'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { loginMock } = vi.hoisted(() => ({ loginMock: vi.fn() }))

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ login: loginMock }),
}))

vi.mock('../components/auth/GoogleButton', () => ({
  default: () => null,
}))

import Login from './Login'

const fillAndSubmit = (container) => {
  fireEvent.change(screen.getByPlaceholderText(/you@example.com/), { target: { value: 'ada@example.com' } })
  fireEvent.change(screen.getByPlaceholderText('••••••••'), { target: { value: 'secret' } })
  const form = container.querySelector('form')
  fireEvent.submit(form)
  return form
}

describe('Login', () => {
  beforeEach(() => {
    window.scrollTo = vi.fn()
    loginMock.mockReset()
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it('does not mount a second background video', () => {
    render(<MemoryRouter><Login /></MemoryRouter>)
    expect(document.querySelectorAll('video')).toHaveLength(0)
  })

  it('ignores a second submit while the first request is in flight', () => {
    loginMock.mockReturnValue(new Promise(() => {}))
    const { container } = render(<MemoryRouter><Login /></MemoryRouter>)

    const form = fillAndSubmit(container)
    fireEvent.submit(form)

    expect(loginMock).toHaveBeenCalledTimes(1)
    expect(loginMock).toHaveBeenCalledWith('ada@example.com', 'secret')
    expect(screen.getByRole('button', { name: /signing in/i })).toBeDisabled()
    expect(screen.getByRole('button', { name: /signing in/i })).toHaveAttribute('aria-busy', 'true')
  })

  it('shows a useful timeout error and enables the button again', async () => {
    loginMock.mockRejectedValue({ code: 'ECONNABORTED' })
    const { container } = render(<MemoryRouter><Login /></MemoryRouter>)

    fillAndSubmit(container)

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent(/took too long/i))
    expect(screen.getByRole('button', { name: /^sign in$/i })).not.toBeDisabled()
  })

  it('explains a request that is taking longer than usual', () => {
    vi.useFakeTimers()
    loginMock.mockReturnValue(new Promise(() => {}))
    const { container } = render(<MemoryRouter><Login /></MemoryRouter>)

    fillAndSubmit(container)
    act(() => { vi.advanceTimersByTime(8_000) })

    expect(screen.getByRole('status')).toHaveTextContent(/taking longer than usual/i)
  })
})
