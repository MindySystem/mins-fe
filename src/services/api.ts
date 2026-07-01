import axios, { AxiosError, type InternalAxiosRequestConfig } from 'axios'

const productionApiBaseUrl = 'https://api.mindytran.io.vn/api'

function normalizeBaseUrl(url: string) {
  return url.replace(/\/+$/, '')
}

function resolveApiBaseUrl() {
  const configuredBaseUrl = normalizeBaseUrl(import.meta.env.VITE_API_BASE_URL || productionApiBaseUrl)

  if (typeof window === 'undefined') {
    return configuredBaseUrl
  }

  try {
    const parsedUrl = new URL(configuredBaseUrl)
    const currentHostname = window.location.hostname
    const isLoopbackApiHost = parsedUrl.hostname === 'localhost' || parsedUrl.hostname === '127.0.0.1'
    const isCurrentLoopbackHost = currentHostname === 'localhost' || currentHostname === '127.0.0.1'

    if (isLoopbackApiHost && !isCurrentLoopbackHost) {
      parsedUrl.hostname = currentHostname
    }

    return normalizeBaseUrl(parsedUrl.toString())
  } catch {
    return configuredBaseUrl
  }
}

// Create an Axios instance with base configuration
const api = axios.create({
  baseURL: resolveApiBaseUrl(),
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
