import axios from 'axios'
import { CONTENT_API_URL, PS_API_URL } from './env'

function createInstance(baseURL: string) {
  const instance = axios.create({ baseURL })

  // Inyectar Bearer token en cada request
  instance.interceptors.request.use((config) => {
    const token = localStorage.getItem('accessToken')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  })

  // Manejo de 401: refrescar token automáticamente
  instance.interceptors.response.use(
    (res) => res,
    async (error) => {
      const original = error.config
      if (error.response?.status === 401 && !original._retry) {
        original._retry = true
        try {
          const refreshToken = localStorage.getItem('refreshToken')
          if (!refreshToken) throw new Error('No refresh token')

          const { data } = await axios.post(`${CONTENT_API_URL}/auth/refresh`, {
            refreshToken,
          })
          localStorage.setItem('accessToken', data.accessToken)
          original.headers.Authorization = `Bearer ${data.accessToken}`
          return instance(original)
        } catch {
          localStorage.removeItem('accessToken')
          localStorage.removeItem('refreshToken')
          window.location.href = '/login'
        }
      }
      return Promise.reject(error)
    },
  )

  return instance
}

export const contentApi = createInstance(CONTENT_API_URL)
export const psApi = createInstance(PS_API_URL)
