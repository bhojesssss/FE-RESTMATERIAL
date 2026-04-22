import { api } from '../../api/client'

const SESSION_KEY = 'rm_session_v1'

function safeJsonParse(value, fallback) {
  try {
    if (!value) return fallback
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

export function getSession() {
  return safeJsonParse(localStorage.getItem(SESSION_KEY), null)
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}

export async function register({ name, email, password }) {
  const data = await api.post('/auth/register', { name, email, password })
  localStorage.setItem(SESSION_KEY, JSON.stringify(data.session))
  return data.session
}

export async function login({ email, password }) {
  const data = await api.post('/auth/login', { email, password })
  localStorage.setItem(SESSION_KEY, JSON.stringify(data.session))
  return data.session
}

export async function updateUser(userId, updates) {
  const data = await api.put(`/users/${userId}`, updates)
  const session = getSession()
  if (session) {
    const nextSession = { ...session, name: data.user.name, city: data.user.city, phone: data.user.phone }
    localStorage.setItem(SESSION_KEY, JSON.stringify(nextSession))
    return nextSession
  }
  return null
}
