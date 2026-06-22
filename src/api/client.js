import axios from 'axios'
import toast from 'react-hot-toast'

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000'

const client = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 15000,
})

// Attach JWT token to every request
client.interceptors.request.use((config) => {
  const token = localStorage.getItem('crm_token')
  if (token) config.headers.Authorization = `Bearer ${token}`
  return config
})

// Global error handling
client.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err.response?.status
    const detail = err.response?.data?.detail

    if (status === 401) {
      localStorage.removeItem('crm_token')
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login'
      }
    } else if (status === 403) {
      toast.error('You don\'t have permission to do that.')
    } else if (status === 422) {
      toast.error('Invalid data — check your inputs.')
    } else if (status >= 500) {
      toast.error('Server error. Please try again.')
    } else if (!err.response) {
      toast.error('Cannot reach the server. Is the backend running?')
    }

    return Promise.reject(err)
  }
)

export default client
