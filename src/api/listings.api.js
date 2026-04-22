import { api } from './client'

export async function createListing(listing) {
  return api.post('/listings', listing)
}

export async function getMyListings() {
  return api.get('/listings/mine')
}

export async function markListingAsSold(id) {
  return api.patch(`/listings/${id}/sold`, {})
}
