import { apiRequest } from './client'

async function getCollection(path) {
  const response = await apiRequest(path)
  return response?.data || []
}

export function getAdminUsers() {
  return getCollection('/api/v1/admin/users')
}

export function getLeadStatuses() {
  return getCollection('/api/v1/admin/lead-statuses')
}

export function getOrigins() {
  return getCollection('/api/v1/admin/origins')
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
