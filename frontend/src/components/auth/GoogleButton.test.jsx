import { cleanup, render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom/vitest'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

const { getMock } = vi.hoisted(() => ({ getMock: vi.fn() }))

vi.mock('../../services/api', () => ({
  default: { get: getMock },
  API_BASE: '/api',
  PROVIDERS_REQUEST_TIMEOUT_MS: 30_000,
}))

const loadGoogleButton = async () => {
  vi.resetModules()
  const module = await import('./GoogleButton')
  return module.default
}

describe('GoogleButton', () => {
  beforeEach(() => {
    getMock.mockReset()
  })

  afterEach(() => {
    cleanup()
  })

  it('shares one provider lookup across login and registration mounts', async () => {
    getMock.mockResolvedValue({ data: { google: true } })
    const GoogleButton = await loadGoogleButton()

    const first = render(<GoogleButton />)
    expect(await screen.findByRole('link', { name: /continue with google/i })).toBeInTheDocument()
    first.unmount()

    render(<GoogleButton />)
    expect(await screen.findByRole('link', { name: /continue with google/i })).toBeInTheDocument()
    expect(getMock).toHaveBeenCalledTimes(1)
    expect(getMock).toHaveBeenCalledWith('/auth/providers', { timeout: 30_000 })
  })

  it('stays hidden when Google is not configured', async () => {
    getMock.mockResolvedValue({ data: { google: false } })
    const GoogleButton = await loadGoogleButton()

    render(<GoogleButton />)
    await waitFor(() => expect(getMock).toHaveBeenCalledTimes(1))
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
  })

  it('tries again on a later mount after a failed lookup', async () => {
    getMock
      .mockRejectedValueOnce(new Error('offline'))
      .mockResolvedValueOnce({ data: { google: true } })
    const GoogleButton = await loadGoogleButton()

    const first = render(<GoogleButton />)
    await waitFor(() => expect(getMock).toHaveBeenCalledTimes(1))
    expect(screen.queryByRole('link')).not.toBeInTheDocument()
    first.unmount()

    render(<GoogleButton />)
    expect(await screen.findByRole('link', { name: /continue with google/i })).toBeInTheDocument()
    expect(getMock).toHaveBeenCalledTimes(2)
  })
})
