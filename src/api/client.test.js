import { beforeEach, describe, expect, it, vi } from 'vitest'
import { apiRequest, ApiError, resetApiClientState } from './client'

function jsonResponse(payload, options = {}) {
  return new Response(JSON.stringify(payload), {
    status: options.status ?? 200,
    headers: { 'Content-Type': 'application/json', ...options.headers },
  })
}

describe('apiRequest', () => {
  beforeEach(() => {
    resetApiClientState()
    vi.restoreAllMocks()
    document.cookie = 'XSRF-TOKEN=; Max-Age=0; path=/'
  })

  it('usa cookie di sessione, inizializza CSRF e serializza il payload', async () => {
    document.cookie = 'XSRF-TOKEN=csrf-token; path=/'
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(jsonResponse({ data: { id: 1 } }))

    await apiRequest('/api/v1/auth/login', {
      method: 'POST',
      body: { email: 'admin@example.test', password: 'secret' },
    })

    expect(fetchMock).toHaveBeenNthCalledWith(
      1,
      'http://localhost:8000/sanctum/csrf-cookie',
      expect.objectContaining({ credentials: 'include' }),
    )
    expect(fetchMock).toHaveBeenNthCalledWith(
      2,
      'http://localhost:8000/api/v1/auth/login',
      expect.objectContaining({
        credentials: 'include',
        method: 'POST',
        body: JSON.stringify({ email: 'admin@example.test', password: 'secret' }),
      }),
    )
    const requestHeaders = fetchMock.mock.calls[1][1].headers
    expect(requestHeaders.get('Content-Type')).toBe('application/json')
    expect(requestHeaders.get('X-XSRF-TOKEN')).toBe('csrf-token')
  })

  it('rinnova CSRF e ripete la richiesta una sola volta dopo un 419', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(jsonResponse({ message: 'Page Expired' }, { status: 419 }))
      .mockResolvedValueOnce(new Response(null, { status: 204 }))
      .mockResolvedValueOnce(jsonResponse({ data: { ok: true } }))

    await expect(apiRequest('/api/v1/auth/logout', { method: 'POST' }))
      .resolves.toEqual({ data: { ok: true } })
    expect(fetchMock).toHaveBeenCalledTimes(4)
  })

  it('normalizza errori 422 e 429', async () => {
    vi.spyOn(globalThis, 'fetch')
      .mockResolvedValueOnce(jsonResponse({
        message: 'The given data was invalid.',
        errors: { email: ['Credenziali non valide.'] },
      }, { status: 422 }))
      .mockResolvedValueOnce(jsonResponse(
        { message: 'Too Many Attempts.' },
        { status: 429, headers: { 'Retry-After': '45' } },
      ))

    const validationError = await apiRequest('/api/v1/example').catch((error) => error)
    expect(validationError).toBeInstanceOf(ApiError)
    expect(validationError.fieldErrors.email).toEqual(['Credenziali non valide.'])

    const throttlingError = await apiRequest('/api/v1/example').catch((error) => error)
    expect(throttlingError).toBeInstanceOf(ApiError)
    expect(throttlingError.status).toBe(429)
    expect(throttlingError.retryAfter).toBe(45)
  })
})
