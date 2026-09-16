import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { deviceNotificationService } from './services/deviceNotificationService';

// Initialize Service Worker for device push notifications
if (typeof window !== 'undefined' && 'serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    deviceNotificationService.registerServiceWorker();
  });
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
