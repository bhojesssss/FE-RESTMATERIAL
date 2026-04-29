// src/services/transactionApi.js
// ═════════════════════════════════════════════════════════════════════════════
// Centralized Transaction API service for FE consumption.
// Wraps all transaction-related API calls via the global request() handler.
//
// Status flow:
//   PENDING → ACCEPTED → PAID → READY_FOR_HANDOVER → COMPLETED
//   PENDING → REJECTED (seller reject, stock restored)
//   PENDING/ACCEPTED → CANCELLED (either party, stock restored)
// ═════════════════════════════════════════════════════════════════════════════

import { request, uploadFiles } from './api'

/**
 * Create a new order (Buyer action).
 * POST /api/transactions
 *
 * @param {{ listing_id: string, quantity: number, delivery_method: 'SELF_PICKUP'|'DELIVERY', delivery_address?: string, buyer_message?: string }} payload
 * @returns {Promise<{ message: string, transaction: object }>}
 */
export async function createOrder(payload) {
  return request('/transactions', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

/**
 * Get current user's transactions.
 * GET /api/transactions
 *
 * @param {{ role?: 'BUYER'|'SELLER'|'ALL', status?: string, page?: number, limit?: number }} [params]
 * @returns {Promise<{ data: object[], pagination: object }>}
 */
export async function getMyTransactions(params = {}) {
  const searchParams = new URLSearchParams()
  if (params.role) searchParams.set('role', params.role)
  if (params.status) searchParams.set('status', params.status)
  if (params.page) searchParams.set('page', String(params.page))
  if (params.limit) searchParams.set('limit', String(params.limit))

  const qs = searchParams.toString()
  return request(`/transactions${qs ? `?${qs}` : ''}`)
}

/**
 * Get single transaction detail.
 * GET /api/transactions/:id
 *
 * @param {string} id - Transaction UUID
 * @returns {Promise<{ transaction: object }>}
 */
export async function getTransactionById(id) {
  return request(`/transactions/${id}`)
}

/**
 * Seller accepts a PENDING order → ACCEPTED.
 * PATCH /api/transactions/:id/accept
 *
 * @param {string} id - Transaction UUID
 * @returns {Promise<{ message: string, transaction: object }>}
 */
export async function acceptTransaction(id) {
  return request(`/transactions/${id}/accept`, {
    method: 'PATCH',
  })
}

/**
 * Seller rejects a PENDING order → REJECTED. Stock restored.
 * PATCH /api/transactions/:id/reject
 *
 * @param {string} id - Transaction UUID
 * @param {string} [reason] - Optional rejection reason
 * @returns {Promise<{ message: string, transaction: object }>}
 */
export async function rejectTransaction(id, reason = null) {
  return request(`/transactions/${id}/reject`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  })
}

/**
 * Cancel a PENDING or ACCEPTED order → CANCELLED. Stock restored.
 * PATCH /api/transactions/:id/cancel
 *
 * @param {string} id - Transaction UUID
 * @param {string} [reason] - Optional cancellation reason
 * @returns {Promise<{ message: string, transaction: object }>}
 */
export async function cancelTransaction(id, reason = null) {
  return request(`/transactions/${id}/cancel`, {
    method: 'PATCH',
    body: JSON.stringify({ reason }),
  })
}

/**
 * Buyer uploads payment proof → PAID.
 * POST /api/transactions/:id/payment
 *
 * @param {string} id - Transaction UUID
 * @param {File} file - Payment proof file (image/PDF)
 * @returns {Promise<{ message: string, transaction: object }>}
 */
export async function uploadPayment(id, file) {
  return uploadFiles(`/transactions/${id}/payment`, [file], 'payment_proof')
}

/**
 * Seller marks order as ready for handover → READY_FOR_HANDOVER.
 * PATCH /api/transactions/:id/ready
 *
 * @param {string} id - Transaction UUID
 * @returns {Promise<{ message: string, transaction: object }>}
 */
export async function markReady(id) {
  return request(`/transactions/${id}/ready`, {
    method: 'PATCH',
  })
}

/**
 * Buyer confirms receipt → COMPLETED. CO2 impact calculated.
 * PATCH /api/transactions/:id/complete
 *
 * @param {string} id - Transaction UUID
 * @returns {Promise<{ message: string, transaction: object, impact: object }>}
 */
export async function completeTransaction(id) {
  return request(`/transactions/${id}/complete`, {
    method: 'PATCH',
  })
}
