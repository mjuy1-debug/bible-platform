// Firebase Cloud Messaging Service Worker
// 앱이 백그라운드/종료 상태일 때도 푸시 알림을 수신합니다.

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

const messaging = firebase.messaging();

// 백그라운드 메시지 수신 처리 (FCM)
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] 백그라운드 메시지 수신:', payload);

  const notificationTitle = payload.notification?.title || payload.data?.title || '👑 [벧엘교회] 새 알림';
  const notificationBody = payload.notification?.body || payload.data?.body || '새로운 성도 활동 또는 가입 신청이 있습니다.';
  const clickUrl = payload.data?.url || payload.notification?.click_action || '/bible-platform/#/admin';

  const notificationOptions = {
    body: notificationBody,
    icon: payload.notification?.icon || 'https://mjuy1-debug.github.io/bible-platform/icon-192.png',
    badge: 'https://mjuy1-debug.github.io/bible-platform/icon-192.png',
    tag: payload.data?.tag || `notif-${Date.now()}`,
    vibrate: [300, 150, 300, 150, 400],
    renotify: true,
    requireInteraction: true,
    data: {
      url: clickUrl,
      ...payload.data
    },
    actions: [
      { action: 'open', title: '확인 및 승인하기 👑' }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 표준 Web Push 이벤트 백그라운드 핸들러
self.addEventListener('push', (event) => {
  if (event.data) {
    try {
      const data = event.data.json();
      const title = data.title || data.notification?.title || '👑 [새 성도 가입 신청]';
      const body = data.body || data.notification?.body || '새로운 성도님이 가입 승인을 요청했습니다.';
      const clickUrl = data.url || '/bible-platform/#/admin';

      const options = {
        body,
        icon: 'https://mjuy1-debug.github.io/bible-platform/icon-192.png',
        badge: 'https://mjuy1-debug.github.io/bible-platform/icon-192.png',
        tag: data.tag || `push-member-${Date.now()}`,
        vibrate: [300, 150, 300, 150, 400],
        renotify: true,
        requireInteraction: true,
        data: { url: clickUrl }
      };

      event.waitUntil(self.registration.showNotification(title, options));
    } catch (e) {
      console.warn('푸시 데이터 파싱 폴백:', e);
    }
  }
});

// 알림 클릭 시 관리자 페이지로 이동
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  const targetUrl = event.notification.data?.url || '/bible-platform/#/admin';

  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) return clients.openWindow(targetUrl);
    })
  );
});
