const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

function getAuthHeader() {
  try {
    const session = JSON.parse(localStorage.getItem('rm_session_v1') || 'null')
    return session?.token ? { Authorization: `Bearer ${session.token}` } : {}
  } catch {
    return {}
  }
}

async function request(path, options = {}) {
  const url = `${BASE_URL}${path}`
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...options.headers,
  }

  const res = await fetch(url, { ...options, headers })
  const data = await res.json()

  if (!res.ok) {
    const err = new Error(data.message || 'Request failed')
    err.code = data.code
    err.status = res.status
    throw err
  }

  return data
}

export const api = {
  get: (path, opts) => request(path, { method: 'GET', ...opts }),
  post: (path, body, opts) => request(path, { method: 'POST', body: JSON.stringify(body), ...opts }),
  put: (path, body, opts) => request(path, { method: 'PUT', body: JSON.stringify(body), ...opts }),
  patch: (path, body, opts) => request(path, { method: 'PATCH', body: JSON.stringify(body), ...opts }),
  delete: (path, opts) => request(path, { method: 'DELETE', ...opts }),
}
