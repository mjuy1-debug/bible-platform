// src/services/notificationService.js
// FCM Web Push 알림 및 브라우저 알림 서비스

import { messaging, getToken, VAPID_KEY, db } from './firebase';
import { doc, setDoc, serverTimestamp } from 'firebase/firestore';
import { getTodayVerse } from '../data/dailyVerses';

const SETTINGS_KEY = 'bible_notification_settings';

// 기본 알림 설정
const DEFAULT_SETTINGS = {
  enabled: false,
  morningTime: '07:00', // 아침 7시 기본
  sound: true,
  topics: {
    dailyVerse: true,   // 매일 아침 오늘의 말씀
    prayerWall: true,   // 중보 기도 새 글
    announcements: true // 교회 공지
  }
};

/**
 * 저장된 알림 설정 가져오기
 */
export function getNotificationSettings() {
  try {
    const saved = localStorage.getItem(SETTINGS_KEY);
    return saved ? { ...DEFAULT_SETTINGS, ...JSON.parse(saved) } : DEFAULT_SETTINGS;
  } catch {
    return DEFAULT_SETTINGS;
  }
}

/**
 * 알림 설정 저장 및 Firestore 동기화
 */
export async function saveNotificationSettings(settings, currentUser = null) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
    if (settings.morningTime) {
      const [h, m] = settings.morningTime.split(':').map(Number);
      localStorage.setItem('push_hour', String(isNaN(h) ? 7 : h));
      localStorage.setItem('push_minute', String(isNaN(m) ? 0 : m));
    }
    localStorage.setItem('push_enabled', settings.enabled ? 'true' : 'false');

    // Firestore에 최신 설정 동기화
    await syncNotificationToFirestore(settings, currentUser);
  } catch (e) {
    console.error('설정 저장 실패:', e);
  }
}

/**
 * Firestore fcmTokens 컬렉션과 토큰/시간/토픽 동기화
 */
export async function syncNotificationToFirestore(settings, currentUser = null) {
  try {
    const token = localStorage.getItem('fcm_token');
    const deviceUid = currentUser?.uid || localStorage.getItem('fcm_device_uid');
    if (!deviceUid && !token) return;

    const docId = deviceUid || `anon_${token.slice(-16)}`;
    const [h, m] = (settings.morningTime || '07:00').split(':').map(Number);

    const dataToSave = {
      enabled: !!settings.enabled,
      notifHour: isNaN(h) ? 7 : h,
      notifMinute: isNaN(m) ? 0 : m,
      topics: settings.topics || { dailyVerse: true, prayerWall: true, announcements: true },
      updatedAt: serverTimestamp()
    };

    if (token) dataToSave.token = token;
    if (currentUser?.uid) {
      dataToSave.uid = currentUser.uid;
      dataToSave.email = currentUser.email || '';
      dataToSave.displayName = currentUser.displayName || '';
    }

    await setDoc(doc(db, 'fcmTokens', docId), dataToSave, { merge: true });
  } catch (err) {
    console.warn('Firestore fcmTokens 동기화 건너뜀:', err?.message);
  }
}

/**
 * 알림 권한 요청 및 FCM 토큰 발급 (백그라운드 푸시 등록)
 */
export async function requestNotificationPermission(currentUser = null) {
  if (!('Notification' in window)) {
    return { ok: false, error: '이 브라우저는 웹 알림을 지원하지 않습니다.' };
  }

  try {
    // 1. 브라우저 권한 요청
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { ok: false, error: '알림 권한이 거부되었습니다. 브라우저 설정에서 권한을 허용해주세요.' };
    }

    // 2. 서비스 워커 등록 확인
    let swReg = null;
    if ('serviceWorker' in navigator) {
      try {
        const swUrl = `${import.meta.env.BASE_URL || '/'}firebase-messaging-sw.js`;
        swReg = await navigator.serviceWorker.register(swUrl);
        await navigator.serviceWorker.ready;
      } catch (swErr) {
        console.warn('서비스워커 등록 경고:', swErr);
      }
    }

    // 3. FCM 토큰 획득
    let token = null;
    try {
      if (messaging) {
        token = await getToken(messaging, {
          vapidKey: VAPID_KEY,
          serviceWorkerRegistration: swReg || undefined
        });
      }
    } catch (fcmErr) {
      console.warn('FCM 토큰 발급 경고 (로컬 알림으로 폴백):', fcmErr.message);
    }

    if (token) {
      localStorage.setItem('fcm_token', token);
    }

    const current = getNotificationSettings();
    const [h, m] = (current.morningTime || '07:00').split(':').map(Number);
    const notifHour = isNaN(h) ? 7 : h;
    const notifMinute = isNaN(m) ? 0 : m;

    // 4. Firestore에 토큰 + 설정 저장
    const docId = currentUser?.uid || (token ? `anon_${token.slice(-16)}` : `device_${Date.now()}`);
    localStorage.setItem('fcm_device_uid', docId);

    if (token) {
      try {
        await setDoc(doc(db, 'fcmTokens', docId), {
          uid: currentUser?.uid || docId,
          email: currentUser?.email || '',
          displayName: currentUser?.displayName || '성도',
          token,
          enabled: true,
          notifHour,
          notifMinute,
          topics: current.topics || { dailyVerse: true, prayerWall: true, announcements: true },
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (dbErr) {
        console.warn('FCM 토큰 DB 저장 건너뜀:', dbErr.message);
      }
    }

    // 설정 활성화 저장
    const updated = { ...current, enabled: true };
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(updated));
    localStorage.setItem('push_enabled', 'true');
    localStorage.setItem('push_hour', String(notifHour));
    localStorage.setItem('push_minute', String(notifMinute));

    return { ok: true, token, permission };
  } catch (error) {
    console.error('알림 권한 요청 실패:', error);
    return { ok: false, error: error.message };
  }
}

/**
 * 브라우저 로컬 알림 발송 (테스트 또는 로컬 스케줄용)
 */
export function showLocalNotification(title, options = {}) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  const defaultOptions = {
    icon: 'https://mjuy1-debug.github.io/bible-platform/icon-192.png',
    badge: 'https://mjuy1-debug.github.io/bible-platform/icon-192.png',
    tag: 'bible-notification',
    vibrate: [300, 150, 300],
    renotify: true,
    requireInteraction: true,
    ...options
  };

  try {
    if (navigator.serviceWorker && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then(reg => {
        reg.showNotification(title, defaultOptions);
      });
    } else {
      new Notification(title, defaultOptions);
    }
    return true;
  } catch (e) {
    console.error('알림 발송 실패:', e);
    return false;
  }
}

/**
 * 오늘의 말씀 알림 조건 검사 및 발송
 * - 오늘 아직 알림을 받지 않았고, 설정된 시간이 되었거나 앱에 접속했을 때 발송
 */
export function checkAndTriggerDailyVerseNotification(force = false) {
  if (!('Notification' in window) || Notification.permission !== 'granted') {
    return false;
  }

  const settings = getNotificationSettings();
  if (!settings.enabled && !force) {
    return false;
  }

  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
  const lastSentDate = localStorage.getItem('last_daily_verse_notif_date');

  // 오늘 이미 발송되었고 강제 발송이 아니면 건너뜀
  if (lastSentDate === todayStr && !force) {
    return false;
  }

  const todayVerse = getTodayVerse();
  const title = `☀️ [화도벧엘교회] 오늘의 은혜로운 말씀`;
  const body = `"${todayVerse.text}"\n- ${todayVerse.ref} -`;

  const success = showLocalNotification(title, {
    body,
    tag: `daily-verse-${todayStr}`,
    data: { url: window.location.origin + window.location.pathname }
  });

  if (success) {
    localStorage.setItem('last_daily_verse_notif_date', todayStr);
  }

  return success;
}

/**
 * 테스트 알림 발송
 */
export function sendTestNotification() {
  const todayVerse = getTodayVerse();
  return showLocalNotification('☀️ [화도벧엘교회] 오늘의 은혜로운 말씀', {
    body: `"${todayVerse.text}"\n- ${todayVerse.ref} -`,
    tag: 'test-daily-verse'
  });
}

/**
 * 관리자: 전체 성도에게 오늘의 말씀 푸시 브로드캐스트 발송
 */
export async function broadcastDailyVerseToAll(currentUser) {
  const todayVerse = getTodayVerse();
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

  const notifData = {
    type: 'daily_verse',
    title: '☀️ [화도벧엘교회] 오늘의 은혜로운 말씀',
    body: `"${todayVerse.text}"\n- ${todayVerse.ref} -`,
    verseText: todayVerse.text,
    verseRef: todayVerse.ref,
    senderUid: currentUser?.uid || 'admin',
    senderName: currentUser?.displayName || '관리자',
    createdAt: serverTimestamp(),
    dateStr: todayStr
  };

  const { addDoc, collection } = await import('firebase/firestore');
  return addDoc(collection(db, 'broadcastNotifications'), notifData);
}
