import { apiRequest } from './client'

const unwrap = (response) => response?.data ?? response
export async function getPractice(id) { return unwrap(await apiRequest(`/api/v1/practices/${id}`)) }
export async function createPractice(leadId) { return unwrap(await apiRequest(`/api/v1/leads/${leadId}/practice`, { method: 'POST' })) }
export async function requestDocument(practiceId, name) { return unwrap(await apiRequest(`/api/v1/practices/${practiceId}/documents`, { method: 'POST', body: { name } })) }
export async function uploadDocument(id, file) { const body = new FormData(); body.append('file', file); return unwrap(await apiRequest(`/api/v1/practice-documents/${id}/upload`, { method: 'POST', body })) }
export async function updateDocument(id, changes) { return unwrap(await apiRequest(`/api/v1/practice-documents/${id}`, { method: 'PATCH', body: changes })) }
export async function downloadDocument(id) { return apiRequest(`/api/v1/practice-documents/${id}/download`, { responseType: 'blob' }) }
export async function addPracticeNote(id, body) { return unwrap(await apiRequest(`/api/v1/practices/${id}/notes`, { method: 'POST', body: { body } })) }
