import { api } from './client'

export async function fetchImpactStats() {
  return api.get('/impact')
}
