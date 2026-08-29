// firebase-messaging-sw.js
// Firebase Cloud Messaging Service Worker
// 앱이 백그라운드/종료 상태일 때도 FCM 푸시 알림을 수신합니다.

importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.12.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBB65Nw8MZZr1DumXeInlVrR5Mr9bssCAk",
  authDomain: "bible-platform.firebaseapp.com",
  projectId: "bible-platform",
  storageBucket: "bible-platform.firebasestorage.app",
  messagingSenderId: "25518742112",
  appId: "1:25518742112:web:ba2cdfc43f03ac294dc105",
});

const SW_VERSION = 'v3.0.0-full-background-push';
const APP_URL = 'https://mjuy1-debug.github.io/bible-platform';

// ── 즉시 활성화 및 구버전 캐시 완전 삭제 ──
self.addEventListener('install', (event) => {
  console.log('[SW] 설치됨:', SW_VERSION);
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[SW] 활성화됨:', SW_VERSION);
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(keys.map((key) => caches.delete(key)));
    }).then(() => clients.claim())
  );
});

const messaging = firebase.messaging();

// ── 알림 타입별 링크/아이콘/설정 결정 ──
function getNotifConfig(type, data) {
  const base = {
    icon: `${APP_URL}/icon-192.png`,
    badge: `${APP_URL}/icon-192.png`,
  };

  switch (type) {
    case 'daily_verse':
      return { ...base, requireInteraction: false, vibrate: [200, 100, 200], url: APP_URL };
    case 'urgent_prayer':
      return { ...base, requireInteraction: true, vibrate: [300, 100, 300, 100, 400], url: `${APP_URL}/#/prayer-wall` };
    case 'announcement':
      return { ...base, requireInteraction: false, url: `${APP_URL}/#/announce` };
    case 'broadcast':
      return { ...base, requireInteraction: false, url: APP_URL };
    case 'new_member':
      return { ...base, requireInteraction: true, vibrate: [300, 100, 300], url: `${APP_URL}/#/admin` };
    case 'live_stream':
      return { ...base, requireInteraction: true, vibrate: [200, 100, 200, 100, 400], url: `${APP_URL}/#/sermon` };
    default:
      return { ...base, requireInteraction: false, url: data?.url || APP_URL };
  }
}

// ── FCM 백그라운드 메시지 수신 (Cloud Functions에서 발송한 메시지) ──
messaging.onBackgroundMessage((payload) => {
  console.log('[SW] FCM 백그라운드 메시지 수신:', payload);

  const notifTitle = payload.notification?.title || payload.data?.title || '☀️ [화도벧엘교회]';
  const notifBody  = payload.notification?.body  || payload.data?.body  || '새로운 알림이 있습니다.';
  const type       = payload.data?.type || '';
  const config     = getNotifConfig(type, payload.data);

  const options = {
    body: notifBody,
    icon:  config.icon,
    badge: config.badge,
    tag:   payload.data?.tag || `notif-${type}-${Date.now()}`,
    vibrate: config.vibrate || [200, 100, 200],
    renotify: true,
    requireInteraction: config.requireInteraction,
    data: {
      url: payload.data?.url || config.url,
      type,
      ...payload.data,
    },
    actions: type === 'new_member'
      ? [{ action: 'open', title: '승인 화면 열기 👑' }]
      : type === 'urgent_prayer'
      ? [{ action: 'open', title: '함께 기도하기 🙏' }]
      : type === 'live_stream'
      ? [{ action: 'open', title: '예배 참여하기 🔴' }]
      : [],
  };

  self.registration.showNotification(notifTitle, options);
});

// ── 표준 Web Push 이벤트 핸들러 (폴백) ──
self.addEventListener('push', (event) => {
  if (!event.data) return;

  try {
    const data  = event.data.json();
    const title = data.notification?.title || data.title || '☀️ [화도벧엘교회]';
    const body  = data.notification?.body  || data.body  || '새로운 알림이 있습니다.';
    const type  = data.data?.type || data.type || '';
    const config = getNotifConfig(type, data.data || data);

    const options = {
      body,
      icon:  config.icon,
      badge: config.badge,
      tag:   data.data?.tag || `push-${Date.now()}`,
      vibrate: config.vibrate || [200, 100, 200],
      renotify: true,
      requireInteraction: config.requireInteraction,
      data: { url: data.data?.url || config.url, type },
    };

    event.waitUntil(self.registration.showNotification(title, options));
  } catch (e) {
    console.warn('[SW] 푸시 데이터 파싱 실패:', e);
  }
});

// ── 알림 클릭 → 타입별 적절한 페이지로 이동 ──
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  const targetUrl = event.notification.data?.url || APP_URL;

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      // 이미 열려있는 앱 탭이 있으면 해당 탭으로 이동
      for (const client of clientList) {
        if ('focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // 열려있는 탭이 없으면 새 창 열기
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
