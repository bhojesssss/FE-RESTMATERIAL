// src/tests/helpers.js
// ═════════════════════════════════════════════════════════════════════════════
// Shared test utilities untuk Transaction Workflow integration tests.
// Helper ini handle auth (login via Supabase), API calls, dan file upload.
// ═════════════════════════════════════════════════════════════════════════════

import { createClient } from '@supabase/supabase-js'

// ─── Config ─────────────────────────────────────────────────────────────────

const API_BASE = 'http://localhost:3000/api'
const SUPABASE_URL = 'https://hqujbzcfaqsqhxpapvqd.supabase.co'
const SUPABASE_ANON_KEY =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhxdWpiemNmYXFzcWh4cGFwdnFkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1MDQzNzgsImV4cCI6MjA5MjA4MDM3OH0.THeFFmhR8ebJWKadVLD5HvO_aWHby2bRtl0Me7YpEIc'

// ─── Test Personas ──────────────────────────────────────────────────────────

export const SELLER = {
  email: 'antariksakusumaharmawan6801@gmail.com',
  password: '12345678',
}

export const BUYER = {
  email: 'bhojanaradhipa@gmail.com',
  password: '12345678',
}

// ─── Supabase Client (untuk login via auth) ─────────────────────────────────

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

// ─── loginAs: Login via Supabase Auth, return JWT token ─────────────────────
/**
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{ token: string, userId: string }>}
 */
export async function loginAs(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    throw new Error(`Login gagal untuk ${email}: ${error.message}`)
  }

  return {
    token: data.session.access_token,
    userId: data.user.id,
  }
}

// ─── apiRequest: Generic JSON API caller ────────────────────────────────────
/**
 * @param {string} method - HTTP method (GET, POST, PATCH, DELETE)
 * @param {string} endpoint - e.g. '/transactions'
 * @param {string} token - JWT token
 * @param {object} [body] - JSON body (optional)
 * @returns {Promise<{ status: number, data: any }>}
 */
export async function apiRequest(method, endpoint, token, body = null) {
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
  }

  if (body && method !== 'GET') {
    options.body = JSON.stringify(body)
  }

  const response = await fetch(`${API_BASE}${endpoint}`, options)
  const text = await response.text()

  let data
  try {
    data = JSON.parse(text)
  } catch {
    data = { raw: text }
  }

  return { status: response.status, data }
}

// ─── apiUpload: Multipart form upload (untuk payment proof) ─────────────────
/**
 * @param {string} endpoint - e.g. '/transactions/:id/payment'
 * @param {string} token - JWT token
 * @param {Buffer} fileBuffer - file content as Buffer
 * @param {string} fieldName - form field name (default: 'payment_proof')
 * @param {string} filename - filename (default: 'proof.png')
 * @param {string} mimeType - MIME type (default: 'image/png')
 * @returns {Promise<{ status: number, data: any }>}
 */
export async function apiUpload(
  endpoint,
  token,
  fileBuffer,
  fieldName = 'payment_proof',
  filename = 'proof.png',
  mimeType = 'image/png'
) {
  // Bikin minimal PNG file kalau buffer kosong
  // (1x1 pixel transparent PNG)
  const actualBuffer =
    fileBuffer ||
    Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    )

  const blob = new Blob([actualBuffer], { type: mimeType })

  const formData = new FormData()
  formData.append(fieldName, blob, filename)

  const response = await fetch(`${API_BASE}${endpoint}`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      // Jangan set Content-Type — browser auto-set boundary
    },
    body: formData,
  })

  const text = await response.text()
  let data
  try {
    data = JSON.parse(text)
  } catch {
    data = { raw: text }
  }

  return { status: response.status, data }
}

// ─── getSellerListing: Cari listing AVAILABLE milik seller ──────────────────
/**
 * Fetch listings dari marketplace dan cari yang milik seller account.
 * @param {string} sellerToken - JWT token seller
 * @returns {Promise<object>} listing object
 */
export async function getSellerListing(sellerToken) {
  const { status, data } = await apiRequest(
    'GET',
    '/listings/me',
    sellerToken
  )

  if (status !== 200) {
    throw new Error(`Gagal fetch seller listings: ${status}`)
  }

  const listings = Array.isArray(data?.data) ? data.data : []
  const available = listings.find((l) => l.status === 'AVAILABLE')

  if (!available) {
    throw new Error(
      'Tidak ada listing AVAILABLE milik seller. Pastikan seller punya minimal 1 listing aktif.'
    )
  }

  return available
}

// ─── getListing: Fetch single listing by ID ─────────────────────────────────
/**
 * @param {string} id - listing UUID
 * @param {string} [token] - optional JWT (bisa tanpa auth kalau endpoint public)
 * @returns {Promise<object>} listing object
 */
export async function getListing(id, token = null) {
  const headers = {}
  if (token) {
    headers['Authorization'] = `Bearer ${token}`
  }

  const response = await fetch(`${API_BASE}/listings/${id}`, { headers })
  const data = await response.json()

  return data?.listing || data
}
