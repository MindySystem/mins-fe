import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

// Create an Axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
})

// Request Interceptor: Attach Auth Token
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    const token = localStorage.getItem('access_token')
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Response Interceptor: Handle errors globally
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error: AxiosError) => {
    if (error.response) {
      const { status } = error.response
      if (status === 401) {
        localStorage.removeItem('access_token')
        // Avoid logging from server-side / scripts
        if (typeof window !== 'undefined') {
          console.error('Unauthorized access.')
        }
      } else if (status === 403) {
        console.error('Forbidden access.')
      } else if (status >= 500) {
        console.error('Server error.')
      }
    }
    return Promise.reject(error)
  },
)

export default api
