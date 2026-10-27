import axios from 'axios'

export const API_BASE = (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/api'

const api = axios.create({
  baseURL: API_BASE,
  timeout: 120000,
  headers: {
    'Content-Type': 'application/json',
  },
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    // Only 401 means the session is gone. A 403 is a normal authorization
    // denial and must not log the user out.
    if (status === 401 && Boolean(error.config?.headers?.Authorization)) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      const returnTo = `${window.location.pathname}${window.location.search}`
      window.location.href = `/login?returnTo=${encodeURIComponent(returnTo)}`
    }
    return Promise.reject(error)
  }
)

/**
 * A message that is safe to show a candidate. Prefers the server's own wording
 * (it distinguishes 429, validation and conflicts), then a readable fallback for
 * timeouts, offline and 5xx so the user is never left with "Request failed".
 */
export const errorMessage = (error, fallback = 'Something went wrong. Please retry.') => {
  const status = error?.response?.status
  const serverMessage = error?.response?.data?.message
  if (status === 429) return serverMessage || 'Too many attempts. Wait a minute and try again.'
  if (serverMessage) return serverMessage
  if (error?.code === 'ECONNABORTED') return 'The server took too long to answer. Please retry.'
  if (status >= 500) return 'The server hit an error. Please retry in a moment.'
  if (!error?.response) return 'Cannot reach the server. Check your connection and retry.'
  return fallback
}

export default api
