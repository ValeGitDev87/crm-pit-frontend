import { apiRequest } from './client'

function unwrap(response) {
  return response?.data ?? response
}

export async function loginRequest(credentials) {
  return unwrap(await apiRequest('/api/v1/auth/login', {
    method: 'POST',
    body: credentials,
  }))
}

export async function currentUserRequest() {
  return unwrap(await apiRequest('/api/v1/auth/me'))
}

export async function logoutRequest() {
  return apiRequest('/api/v1/auth/logout', { method: 'POST' })
}
