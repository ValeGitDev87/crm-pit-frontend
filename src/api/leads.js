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
