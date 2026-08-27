import { apiRequest } from './client'

async function getCollection(path) {
  const response = await apiRequest(path)
  return response?.data || []
}

export function getAdminUsers() {
  return getCollection('/api/v1/admin/users')
}

export async function createAdminUser(payload) {
  const response = await apiRequest('/api/v1/admin/users', { method: 'POST', body: payload })
  return response?.data ?? response
}

export async function updateAdminUser(id, payload) {
  const response = await apiRequest(`/api/v1/admin/users/${id}`, { method: 'PATCH', body: payload })
  return response?.data ?? response
}

export function getLeadStatuses() {
  return getCollection('/api/v1/admin/lead-statuses')
}

export async function createLeadStatus(payload) {
  const response = await apiRequest('/api/v1/admin/lead-statuses', { method: 'POST', body: payload })
  return response?.data ?? response
}

export async function updateLeadStatus(id, payload) {
  const response = await apiRequest(`/api/v1/admin/lead-statuses/${id}`, { method: 'PATCH', body: payload })
  return response?.data ?? response
}

export function deleteLeadStatus(id) {
  return apiRequest(`/api/v1/admin/lead-statuses/${id}`, { method: 'DELETE' })
}

export function getOrigins() {
  return getCollection('/api/v1/admin/origins')
}

export async function createOrigin(payload) {
  const response = await apiRequest('/api/v1/admin/origins', { method: 'POST', body: payload })
  return response?.data ?? response
}

export async function updateOrigin(id, payload) {
  const response = await apiRequest(`/api/v1/admin/origins/${id}`, { method: 'PATCH', body: payload })
  return response?.data ?? response
}

export function deleteOrigin(id) {
  return apiRequest(`/api/v1/admin/origins/${id}`, { method: 'DELETE' })
}

export async function updateOriginOperators(id, operators) {
  const response = await apiRequest(`/api/v1/admin/origins/${id}/operators`, {
    method: 'PUT',
    body: { operators },
  })
  return response?.data ?? response
}

export async function getRecycles(params = {}) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => { if (value !== '' && value != null) search.set(key, value) })
  const query = search.toString()
  const response = await apiRequest(`/api/v1/admin/recycles${query ? `?${query}` : ''}`)
  return { data: response?.data || [], meta: response?.meta || {} }
}

export async function assignRecycle(cycleId, userId) {
  const response = await apiRequest(`/api/v1/admin/recycles/${cycleId}/assignment`, { method: 'PATCH', body: { user_id: Number(userId) } })
  return response?.data ?? response
}

export async function getOrigin(id) {
  const response = await apiRequest(`/api/v1/admin/origins/${id}`)
  return response?.data ?? response
}

export async function assignLead(leadId, userId) {
  const response = await apiRequest(`/api/v1/admin/leads/${leadId}/assignment`, {
    method: 'PATCH',
    body: { user_id: Number(userId) },
  })
  return response?.data ?? response
}
