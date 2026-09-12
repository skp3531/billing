import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { Toaster } from 'react-hot-toast'
import api from './api/axios'
import { useAuthStore } from './store/authStore'

// Show a friendly "waking up" splash screen
const showSplash = (message: string, subtext: string = '') => {
  const root = document.getElementById('root')!;
  root.innerHTML = `
    <div style="
      min-height: 100vh;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      background: linear-gradient(135deg, #b45309 0%, #78350f 100%);
      font-family: Inter, sans-serif;
      padding: 24px;
      text-align: center;
    ">
      <div style="
        background: rgba(255,255,255,0.12);
        border-radius: 24px;
        padding: 40px 32px;
        max-width: 340px;
        width: 100%;
      ">
        <div style="
          width: 72px; height: 72px;
          background: rgba(255,255,255,0.2);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 20px;
          font-size: 36px;
        ">🏪</div>
        <h1 style="color: white; font-size: 28px; font-weight: 800; margin: 0 0 8px;">RestoPOS</h1>
        <p style="color: rgba(255,255,255,0.85); font-size: 15px; margin: 0 0 28px;">${message}</p>
        <div style="
          width: 48px; height: 48px;
          border: 4px solid rgba(255,255,255,0.3);
          border-top-color: white;
          border-radius: 50%;
          animation: spin 0.8s linear infinite;
          margin: 0 auto 20px;
        "></div>
        ${subtext ? `<p style="color: rgba(255,255,255,0.6); font-size: 12px; margin: 0;">${subtext}</p>` : ''}
      </div>
      <style>
        @keyframes spin { to { transform: rotate(360deg); } }
      </style>
    </div>
  `;
};

const initApp = async () => {
  showSplash('Starting up...', 'Please wait a moment');

  // Give the server up to 60 seconds to wake up (Render free tier sleep)
  const controller = new AbortController();
  const timeout = setTimeout(() => {
    showSplash(
      'Server is waking up…',
      'This takes ~30 seconds on first visit. Hang tight!'
    );
  }, 5000);

  try {
    const res = await api.post('/auth/refresh', {}, {
      signal: controller.signal,
      timeout: 65000,
    } as any);
    clearTimeout(timeout);
    const { accessToken } = res.data.data;
    useAuthStore.getState().setAccessToken(accessToken);
  } catch (error: any) {
    clearTimeout(timeout);
    // Silent fail — user will be redirected to login by ProtectedRoute
    useAuthStore.getState().logout();
  }

  // Clear splash and mount app
  document.getElementById('root')!.innerHTML = '';
  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <App />
      <Toaster position="top-right" />
    </React.StrictMode>,
  );
};

initApp();
