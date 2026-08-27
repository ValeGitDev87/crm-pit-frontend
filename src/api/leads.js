import { apiRequest } from './client'

function compactParams(params) {
  const search = new URLSearchParams()
  Object.entries(params).forEach(([key, value]) => {
    if (value !== '' && value != null) search.set(key, value)
  })
  return search.toString()
}

export async function getLeads(params = {}) {
  const query = compactParams(params)
  const response = await apiRequest(`/api/v1/leads${query ? `?${query}` : ''}`)
  return { data: response?.data || [], meta: response?.meta || {} }
}

export async function getLead(id) {
  const response = await apiRequest(`/api/v1/leads/${id}`)
  return response?.data ?? response
}

export async function getWorkflowStatuses() {
  const response = await apiRequest('/api/v1/lead-statuses')
  return response?.data || []
}

export async function changeLeadStatus(leadId, statusId) {
  const response = await apiRequest(`/api/v1/leads/${leadId}/status`, {
    method: 'PATCH',
    body: { status_id: Number(statusId) },
  })
  return response?.data ?? response
}

export async function addLeadNote(leadId, body) {
  const response = await apiRequest(`/api/v1/leads/${leadId}/notes`, {
    method: 'POST',
    body: { body },
  })
  return response?.data ?? response
}

export async function createLeadTask(leadId, task) {
  const response = await apiRequest(`/api/v1/leads/${leadId}/tasks`, {
    method: 'POST',
    body: task,
  })
  return response?.data ?? response
}

export async function updateLeadTask(taskId, changes) {
  const response = await apiRequest(`/api/v1/lead-tasks/${taskId}`, {
    method: 'PATCH',
    body: changes,
  })
  return response?.data ?? response
}
