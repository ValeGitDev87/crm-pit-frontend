import { apiRequest } from './client'

export async function getDashboard() {
  const response = await apiRequest('/api/v1/dashboard')
  return response?.data ?? response
}
