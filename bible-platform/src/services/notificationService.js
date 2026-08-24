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
 * 알림 설정 저장
 */
export function saveNotificationSettings(settings) {
  try {
    localStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  } catch (e) {
    console.error('설정 저장 실패:', e);
  }
}

/**
 * 알림 권한 요청 및 FCM 토큰 발급
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
      swReg = await navigator.serviceWorker.ready;
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
      console.warn('FCM 토큰 발급 경고 (로컬 브라우저 알림으로 폴백):', fcmErr.message);
    }

    // 4. Firestore에 토큰 저장 (로그인된 경우)
    if (token && currentUser?.uid) {
      try {
        await setDoc(doc(db, 'fcmTokens', currentUser.uid), {
          uid: currentUser.uid,
          email: currentUser.email || '',
          displayName: currentUser.displayName || '',
          token,
          updatedAt: serverTimestamp()
        }, { merge: true });
      } catch (dbErr) {
        console.warn('FCM 토큰 DB 저장 건너뜀:', dbErr.message);
      }
    }

    // 설정 활성화 저장
    const current = getNotificationSettings();
    saveNotificationSettings({ ...current, enabled: true });

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
 * 테스트 알림 발송
 */
export function sendTestNotification() {
  const todayVerse = getTodayVerse();
  return showLocalNotification('✨ [테스트 알림] 오늘의 은혜로운 말씀', {
    body: `"${todayVerse.text}"\n- ${todayVerse.ref} -`,
    tag: 'test-notification'
  });
}
