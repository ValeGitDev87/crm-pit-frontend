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

export async function getPlanningTasks() {
  const leads = []
  let page = 1
  let lastPage = 1

  while (page <= lastPage) {
    const result = await getLeads({ page, per_page: 100 })
    leads.push(...result.data)
    lastPage = Number(result.meta.last_page || 1)
    page += 1
  }

  const details = []
  for (let index = 0; index < leads.length; index += 8) {
    const batch = await Promise.allSettled(leads.slice(index, index + 8).map((lead) => getLead(lead.id)))
    batch.forEach((result) => {
      if (result.status === 'fulfilled') details.push(result.value)
    })
  }

  return details.flatMap((lead) => {
    const cycle = lead.cycles?.find((item) => item.cycle_number === lead.current_cycle_number)
    const contactName = [lead.contact?.first_name, lead.contact?.last_name].filter(Boolean).join(' ') || `Lead #${lead.id}`
    return (cycle?.tasks || [])
      .filter((task) => task.status === 'pending' && task.due_at)
      .map((task) => ({
        ...task,
        lead_id: lead.id,
        contact_name: contactName,
        origin_name: lead.origin?.name || '',
        operator_name: lead.current_assigned_user?.name || '',
      }))
  }).sort((first, second) => new Date(first.due_at) - new Date(second.due_at))
}
