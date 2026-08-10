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

// 백그라운드 메시지 수신 처리
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] 백그라운드 메시지 수신:', payload);

  const notificationTitle = payload.notification?.title || '오늘의 말씀 묵상 ✨';
  const notificationOptions = {
    body: payload.notification?.body || '오늘의 말씀을 읽고 하루를 시작해보세요. 🙏',
    icon: payload.notification?.icon || '/favicon.svg',
    badge: '/favicon.svg',
    tag: 'daily-devotion',
    data: payload.data,
    actions: [
      { action: 'open', title: '말씀 읽기 열기' }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// 알림 클릭 시 앱 열기
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) return client.focus();
      }
      if (clients.openWindow) return clients.openWindow('/');
    })
  );
});
