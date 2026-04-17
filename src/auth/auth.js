const USERS_KEY = 'rm_users_v1'
const SESSION_KEY = 'rm_session_v1'

function safeJsonParse(value, fallback) {
  try {
    if (!value) return fallback
    return JSON.parse(value)
  } catch {
    return fallback
  }
}

export function getUsers() {
  return safeJsonParse(localStorage.getItem(USERS_KEY), [])
}

export function getSession() {
  return safeJsonParse(localStorage.getItem(SESSION_KEY), null)
}

export function logout() {
  localStorage.removeItem(SESSION_KEY)
}

export function register({ name, email, password }) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  const nextUser = {
    id: crypto?.randomUUID ? crypto.randomUUID() : String(Date.now()),
    name: String(name || '').trim(),
    email: normalizedEmail,
    password: String(password || ''),
    createdAt: new Date().toISOString(),
  }

  const users = getUsers()
  if (users.some((u) => u.email === normalizedEmail)) {
    const err = new Error('Email already registered')
    err.code = 'EMAIL_TAKEN'
    throw err
  }

  const updated = [...users, nextUser]
  localStorage.setItem(USERS_KEY, JSON.stringify(updated))

  const session = { userId: nextUser.id, email: nextUser.email, name: nextUser.name, loggedInAt: new Date().toISOString() }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

export function login({ email, password }) {
  const normalizedEmail = String(email || '').trim().toLowerCase()
  const users = getUsers()
  const user = users.find((u) => u.email === normalizedEmail)

  if (!user || user.password !== String(password || '')) {
    const err = new Error('Invalid email or password')
    err.code = 'INVALID_CREDENTIALS'
    throw err
  }

  const session = { userId: user.id, email: user.email, name: user.name, loggedInAt: new Date().toISOString() }
  localStorage.setItem(SESSION_KEY, JSON.stringify(session))
  return session
}

