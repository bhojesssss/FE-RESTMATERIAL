import { fetchImpactStats } from '../../api/impact.api'

export async function getImpactStats() {
  return fetchImpactStats()
}
