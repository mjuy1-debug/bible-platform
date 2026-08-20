const functions = require('firebase-functions/v2');
const admin = require('firebase-admin');

admin.initializeApp();

const APP_URL = 'https://mjuy1-debug.github.io/bible-platform';
const ICON_URL = `${APP_URL}/icon-192.png`;

/**
 * 매분 실행 - 각 사용자의 알림 시간과 현재 시간이 일치하면 FCM 푸시 알림 전송
 * ⚠️ Firebase Blaze(유료) 플랜이 필요합니다
 * 배포: firebase deploy --only functions
 */
exports.sendDailyDevotionNotifications = functions.scheduler.onSchedule(
  { schedule: 'every 1 minutes', timeZone: 'Asia/Seoul' },
  async () => {
    const db = admin.firestore();

    // 서버는 UTC이므로 한국 시간(KST = UTC+9)으로 변환
    const now = new Date();
    const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    const currentHour   = kstTime.getUTCHours();
    const currentMinute = kstTime.getUTCMinutes();

    const snapshot = await db.collection('fcmTokens')
      .where('enabled', '==', true)
      .where('notifHour',   '==', currentHour)
      .where('notifMinute', '==', currentMinute)
      .get();

    if (snapshot.empty) {
      console.log(`[${currentHour}:${String(currentMinute).padStart(2,'0')}] 알림 대상 없음`);
      return;
    }

    const messages = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (!data.token) return;
      messages.push({
        token: data.token,
        notification: {
          title: '오늘의 말씀 묵상 ✨',
          body: '오늘의 말씀을 읽고 하루를 시작해보세요. 하나님의 은혜가 충만하기를 기도합니다. 🙏',
        },
        webpush: {
          notification: {
            icon: ICON_URL,
            badge: ICON_URL,
            requireInteraction: false,
          },
          fcmOptions: { link: APP_URL }
        }
      });
    });

    if (messages.length === 0) return;

    const chunks = [];
    for (let i = 0; i < messages.length; i += 500) chunks.push(messages.slice(i, i + 500));

    for (const chunk of chunks) {
      const result = await admin.messaging().sendEach(chunk);
      console.log(`말씀 알림 전송: 성공 ${result.successCount}명 / 실패 ${result.failureCount}명`);
      result.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error?.code === 'messaging/registration-token-not-registered') {
          const uid = snapshot.docs[idx]?.id;
          if (uid) db.collection('fcmTokens').doc(uid).update({ enabled: false });
        }
      });
    }
  }
);

/**
 * 긴급 기도 제목 알림
 * prayerWall 컬렉션에 isUrgent=true 문서가 생성되면
 * 알림이 활성화된 모든 사용자에게 즉시 FCM 푸시 전송
 * 배포: firebase deploy --only functions
 */
exports.sendUrgentPrayerNotification = functions.firestore.onDocumentCreated(
  'prayerWall/{docId}',
  async (event) => {
    const data = event.data?.data();
    if (!data || !data.isUrgent) return; // 긴급 체크 안 된 기도는 무시

    const db     = admin.firestore();
    const author  = data.author || '익명';
    const text    = data.text   || '';
    const preview = text.length > 60 ? text.slice(0, 60) + '…' : text;

    // 알림 활성화된 모든 사용자 토큰 조회
    const tokenSnap = await db.collection('fcmTokens')
      .where('enabled', '==', true)
      .get();

    if (tokenSnap.empty) {
      console.log('긴급 기도 알림: 등록된 토큰 없음');
      return;
    }

    const messages = [];
    tokenSnap.forEach(docSnap => {
      const d = docSnap.data();
      if (!d.token) return;
      messages.push({
        token: d.token,
        notification: {
          title: `🚨 긴급 기도 요청 — ${author}`,
          body: preview,
        },
        webpush: {
          notification: {
            icon:  ICON_URL,
            badge: ICON_URL,
            requireInteraction: true,     // 긴급 → 사용자가 직접 닫아야 함
            vibrate: [200, 100, 200],
          },
          fcmOptions: { link: `${APP_URL}/#/prayer-wall` }
        }
      });
    });

    if (messages.length === 0) return;

    const chunks = [];
    for (let i = 0; i < messages.length; i += 500) chunks.push(messages.slice(i, i + 500));

    for (const chunk of chunks) {
      const result = await admin.messaging().sendEach(chunk);
      console.log(`긴급 기도 알림 전송: 성공 ${result.successCount}명 / 실패 ${result.failureCount}명`);
      result.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error?.code === 'messaging/registration-token-not-registered') {
          const uid = tokenSnap.docs[idx]?.id;
          if (uid) db.collection('fcmTokens').doc(uid).update({ enabled: false });
        }
      });
    }
  }
);
/**
 * 교회 전체 공지 알림
 * churchAnnouncements 컬렉션에 문서가 생성되면
 * 알림이 활성화된 모든 사용자에게 즉시 FCM 푸시 전송
 * 배포: firebase deploy --only functions
 */
exports.sendChurchAnnouncementNotification = functions.firestore.onDocumentCreated(
  'churchAnnouncements/{docId}',
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    const db     = admin.firestore();
    const title  = data.title  || '교회 공지';
    const body   = data.body   || '';
    const preview = body.length > 80 ? body.slice(0, 80) + '…' : body;

    // 알림 활성화된 모든 사용자 토큰 조회
    const tokenSnap = await db.collection('fcmTokens')
      .where('enabled', '==', true)
      .get();

    if (tokenSnap.empty) {
      console.log('교회 공지 알림: 등록된 토큰 없음');
      return;
    }

    const messages = [];
    tokenSnap.forEach(docSnap => {
      const d = docSnap.data();
      if (!d.token) return;
      messages.push({
        token: d.token,
        notification: {
          title: `📢 ${title}`,
          body: preview,
        },
        webpush: {
          notification: {
            icon:  ICON_URL,
            badge: ICON_URL,
            requireInteraction: false,
          },
          fcmOptions: { link: `${APP_URL}/#/announce` }
        }
      });
    });

    if (messages.length === 0) return;

    const chunks = [];
    for (let i = 0; i < messages.length; i += 500) chunks.push(messages.slice(i, i + 500));

    for (const chunk of chunks) {
      const result = await admin.messaging().sendEach(chunk);
      console.log(`교회 공지 알림 전송: 성공 ${result.successCount}명 / 실패 ${result.failureCount}명`);
      result.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error?.code === 'messaging/registration-token-not-registered') {
          const uid = tokenSnap.docs[idx]?.id;
          if (uid) db.collection('fcmTokens').doc(uid).update({ enabled: false });
        }
      });
    }
  }
);
