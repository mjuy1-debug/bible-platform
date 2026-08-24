import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.jsx';
import './index.css';

// 서비스 워커 글로벌 자동 등록 (백그라운드 푸시 알림 및 오프라인 캐싱)
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    const swUrl = import.meta.env.BASE_URL ? `${import.meta.env.BASE_URL}firebase-messaging-sw.js` : '/firebase-messaging-sw.js';
    navigator.serviceWorker.register(swUrl, { scope: import.meta.env.BASE_URL || '/' })
      .then((reg) => {
        console.log('✅ Service Worker 등록 완료 (Scope:', reg.scope, ')');
      })
      .catch((err) => {
        console.warn('Service Worker 등록 실패:', err);
      });
  });
}

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

