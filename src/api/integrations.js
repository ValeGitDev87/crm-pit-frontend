import { apiRequest } from './client'

function pageQuery(page) {
  return page > 1 ? `?page=${page}` : ''
}

export async function getIntegrationRuns(page = 1) {
  const response = await apiRequest(`/api/v1/admin/integrations/runs${pageQuery(page)}`)
  return { data: response?.data || [], meta: response?.meta || {} }
}

export async function getIntegrationRun(id) {
  const response = await apiRequest(`/api/v1/admin/integrations/runs/${id}`)
  return response?.data ?? response
}

export async function startIntegrationSync(source) {
  const response = await apiRequest(`/api/v1/admin/integrations/${source}/sync`, { method: 'POST' })
  return response?.data ?? response
}

export async function getIntegrationMappings(page = 1) {
  const response = await apiRequest(`/api/v1/admin/integrations/mappings${pageQuery(page)}`)
  return { data: response?.data || [], meta: response?.meta || {} }
}

export async function createIntegrationMapping(payload) {
  const response = await apiRequest('/api/v1/admin/integrations/mappings', { method: 'POST', body: payload })
  return response?.data ?? response
}

export async function updateIntegrationMapping(id, payload) {
  const response = await apiRequest(`/api/v1/admin/integrations/mappings/${id}`, { method: 'PATCH', body: payload })
  return response?.data ?? response
}

export function reprocessImport(id) {
  return apiRequest(`/api/v1/admin/integrations/imports/${id}/reprocess`, { method: 'POST' })
}
