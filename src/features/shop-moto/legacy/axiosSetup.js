import axios from 'axios'

const productionApiBaseUrl = 'https://api.mindytran.io.vn/api'
const apiBaseUrl = (import.meta.env.VITE_API_BASE_URL || productionApiBaseUrl).replace(/\/+$/, '')

function normalizeDocumentIds(value) {
  if (Array.isArray(value)) {
    value.forEach(normalizeDocumentIds)
    return value
  }

  if (!value || typeof value !== 'object') {
    return value
  }

  if (value.id && !value._id) {
    value._id = value.id
  }

  if (value._id && !value.id) {
    value.id = value._id
  }

  Object.values(value).forEach(normalizeDocumentIds)
  return value
}

axios.defaults.baseURL = apiBaseUrl

axios.interceptors.request.use((config) => {
  const url = config.url || ''

  if (/^https?:\/\//i.test(url)) {
    return config
  }

  const normalizedUrl = url.startsWith('/') ? url : `/${url}`

  if (normalizedUrl.startsWith('/api/shop-moto/')) {
    config.url = normalizedUrl.replace('/api', '')
    return config
  }

  if (normalizedUrl.startsWith('/api/')) {
    config.url = normalizedUrl.replace('/api/', '/shop-moto/')
    return config
  }

  if (normalizedUrl.startsWith('/shop-moto/')) {
    config.url = normalizedUrl
    return config
  }

  if (normalizedUrl.startsWith('/maintenance-service') || normalizedUrl.startsWith('/my-mo-to')) {
    config.url = `/shop-moto${normalizedUrl}`
    return config
  }

  config.url = normalizedUrl
  return config
})

axios.interceptors.response.use((response) => {
  normalizeDocumentIds(response.data)
  return response
})
