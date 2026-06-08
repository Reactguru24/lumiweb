import axios from 'axios'

export const apiClient = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: { 'Content-Type': 'application/json' },
})

apiClient.interceptors.request.use((config) => {
  const session = localStorage.getItem('lumi_marketplace_session')
  if (session) {
    const { token } = JSON.parse(session)
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})
