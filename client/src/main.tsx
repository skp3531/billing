import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from 'react-hot-toast'
import api from './api/axios'
import { useAuthStore } from './store/authStore'

const initApp = async () => {
  try {
    const res = await api.post('/auth/refresh')
    const { accessToken } = res.data.data
    useAuthStore.getState().setAccessToken(accessToken)
  } catch (error) {
    // Silent fail on load, user will be directed to login if protected route accessed
    useAuthStore.getState().logout()
  }

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
      <Toaster position="top-right" />
    </React.StrictMode>,
  )
}

initApp()
