import axios from 'axios'

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:8080') + '/api',
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

export default api
