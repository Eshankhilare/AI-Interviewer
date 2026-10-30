import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { getMock, postMock } = vi.hoisted(() => ({
  getMock: vi.fn(),
  postMock: vi.fn(),
}))

vi.mock('../services/api', () => ({
  default: { get: getMock, post: postMock },
  AUTH_REQUEST_TIMEOUT_MS: 30_000,
}))

import { AuthProvider, useAuth } from './AuthContext'

const SessionProbe = () => {
  const { user, loading, login, register } = useAuth()
  return (
    <div>
      <p>{loading ? 'loading' : user?.fullName || 'signed-out'}</p>
      <button type="button" onClick={() => login('ada@example.com', 'secret')}>login</button>
      <button type="button" onClick={() => register({ email: 'ada@example.com', password: 'secret', fullName: 'Ada' })}>register</button>
    </div>
  )
}

describe('AuthProvider', () => {
  beforeEach(() => {
    localStorage.clear()
    getMock.mockReset()
    postMock.mockReset()
  })

  afterEach(() => {
    cleanup()
    localStorage.clear()
  })

  it('restores a stored session on the first render without a loading flash', () => {
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('user', JSON.stringify({ fullName: 'Ada Lovelace' }))

    render(<AuthProvider><SessionProbe /></AuthProvider>)

    expect(screen.getByText('Ada Lovelace')).toBeInTheDocument()
    expect(screen.queryByText('loading')).not.toBeInTheDocument()
  })

  it('clears a half-written session so login does not send a stale token', () => {
    localStorage.setItem('token', 'orphan-token')

    render(<AuthProvider><SessionProbe /></AuthProvider>)

    expect(screen.getByText('signed-out')).toBeInTheDocument()
    expect(localStorage.getItem('token')).toBeNull()
  })

  it('clears corrupt stored auth instead of crashing', () => {
    localStorage.setItem('token', 'test-token')
    localStorage.setItem('user', '{not-json')

    render(<AuthProvider><SessionProbe /></AuthProvider>)

    expect(screen.getByText('signed-out')).toBeInTheDocument()
    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
  })

  it('uses a bounded timeout for login and stores the returned session', async () => {
    postMock.mockResolvedValue({
      data: { token: 'jwt-token', userId: 7, email: 'ada@example.com', fullName: 'Ada Lovelace', role: 'CANDIDATE' },
    })

    render(<AuthProvider><SessionProbe /></AuthProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'login' }))

    await waitFor(() => expect(postMock).toHaveBeenCalledWith(
      '/auth/login',
      { email: 'ada@example.com', password: 'secret' },
      { timeout: 30_000 },
    ))
    await waitFor(() => expect(screen.getByText('Ada Lovelace')).toBeInTheDocument())
    expect(localStorage.getItem('token')).toBe('jwt-token')
    expect(JSON.parse(localStorage.getItem('user'))).toMatchObject({ userId: 7, role: 'CANDIDATE' })
  })

  it('uses the same bounded timeout for registration', async () => {
    postMock.mockResolvedValue({
      data: { token: 'jwt-token', userId: 8, email: 'ada@example.com', fullName: 'Ada', role: 'CANDIDATE' },
    })

    render(<AuthProvider><SessionProbe /></AuthProvider>)
    fireEvent.click(screen.getByRole('button', { name: 'register' }))

    await waitFor(() => expect(postMock).toHaveBeenCalledWith(
      '/auth/register',
      { email: 'ada@example.com', password: 'secret', fullName: 'Ada' },
      { timeout: 30_000 },
    ))
  })
})
