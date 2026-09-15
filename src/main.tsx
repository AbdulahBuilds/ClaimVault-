import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';

const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// In development / localhost mode:
// Automatically unregister any active Service Workers and clear caches so Vite HMR works seamlessly without fetch errors
if (isLocalhost || import.meta.env.DEV) {
  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then((registrations) => {
      registrations.forEach((registration) => {
        registration.unregister();
      });
    });
  }
  if (typeof window !== 'undefined' && 'caches' in window) {
    caches.keys().then((keys) => {
      keys.forEach((key) => caches.delete(key));
    });
  }
} else {
  // In production mode (e.g. Vercel deployment):
  if (typeof window !== 'undefined' && 'caches' in window) {
    caches.keys().then((keys) => {
      keys.forEach((key) => {
        if (key !== 'claimvault-v1.0.3') {
          caches.delete(key);
        }
      });
    });
  }

  if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker
        .register('/sw.js')
        .then((reg) => {
          reg.update();
        })
        .catch((err) => {
          console.warn('[ClaimVault PWA] Service worker registration failed:', err);
        });
    });
  }
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
