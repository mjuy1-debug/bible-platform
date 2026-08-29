const functions = require('firebase-functions/v2');
const admin = require('firebase-admin');
const { getTodayVerse } = require('./dailyVerses');

admin.initializeApp();

const APP_URL = 'https://mjuy1-debug.github.io/bible-platform';
const ICON_URL = `${APP_URL}/icon-192.png`;

// ─────────────────────────────────────────────────────────────────────────────
// 공통 유틸: 토큰 목록으로 FCM 배치 전송
// ─────────────────────────────────────────────────────────────────────────────
async function sendToAllTokens(db, messages) {
  if (!messages || messages.length === 0) return;

  const chunks = [];
  for (let i = 0; i < messages.length; i += 500) {
    chunks.push(messages.slice(i, i + 500));
  }

  for (const chunk of chunks) {
    const result = await admin.messaging().sendEach(chunk);
    console.log(`FCM 전송: 성공 ${result.successCount}명 / 실패 ${result.failureCount}명`);

    // 만료된 토큰 비활성화
    result.responses.forEach((resp, idx) => {
      const errCode = resp.error?.code;
      if (!resp.success && (
        errCode === 'messaging/registration-token-not-registered' ||
        errCode === 'messaging/invalid-registration-token'
      )) {
        const uid = chunk[idx]?._uid;
        if (uid) {
          db.collection('fcmTokens').doc(uid).update({ enabled: false })
            .catch(() => {});
        }
      }
    });
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. ☀️ 매일 아침 오늘의 말씀 알림
//    - 1분마다 실행하여 각 사용자의 설정 시간에 정확히 알림 발송
//    - 앱이 꺼져 있어도 백그라운드에서 발송됨
// ─────────────────────────────────────────────────────────────────────────────
exports.sendDailyVerseNotification = functions.scheduler.onSchedule(
  { schedule: 'every 1 minutes', timeZone: 'Asia/Seoul' },
  async () => {
    const db = admin.firestore();

    // 서버는 UTC → 한국 시간(KST = UTC+9)으로 변환
    const now = new Date();
    const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    const currentHour   = kstTime.getUTCHours();
    const currentMinute = kstTime.getUTCMinutes();

    // 오늘의 말씀 가져오기
    const verse = getTodayVerse(kstTime);
    const todayStr = `${kstTime.getUTCFullYear()}-${String(kstTime.getUTCMonth() + 1).padStart(2, '0')}-${String(kstTime.getUTCDate()).padStart(2, '0')}`;

    // 이 시간에 알림 받을 사용자 조회
    const snapshot = await db.collection('fcmTokens')
      .where('enabled', '==', true)
      .where('notifHour',   '==', currentHour)
      .where('notifMinute', '==', currentMinute)
      .get();

    if (snapshot.empty) {
      console.log(`[${currentHour}:${String(currentMinute).padStart(2,'0')} KST] 알림 대상 없음`);
      return;
    }

    const messages = [];
    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (!data.token) return;

      const msg = {
        token: data.token,
        _uid: docSnap.id, // 만료 토큰 비활성화용
        notification: {
          title: '☀️ [화도벧엘교회] 오늘의 말씀',
          body: `"${verse.text}" — ${verse.ref}`,
        },
        webpush: {
          notification: {
            icon:  ICON_URL,
            badge: ICON_URL,
            requireInteraction: false,
            tag: `daily-verse-${todayStr}`,
            vibrate: [200, 100, 200],
          },
          fcmOptions: { link: APP_URL }
        },
        data: {
          type: 'daily_verse',
          verseText: verse.text,
          verseRef: verse.ref,
          url: APP_URL,
        }
      };
      messages.push(msg);
    });

    console.log(`[${currentHour}:${String(currentMinute).padStart(2,'0')} KST] 오늘의 말씀 알림 대상: ${messages.length}명`);
    await sendToAllTokens(db, messages);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// 2. 🚨 긴급 기도 제목 알림 (prayerWall 문서 생성 시 즉시 발송)
// ─────────────────────────────────────────────────────────────────────────────
exports.sendUrgentPrayerNotification = functions.firestore.onDocumentCreated(
  'prayerWall/{docId}',
  async (event) => {
    const data = event.data?.data();
    if (!data || !data.isUrgent) return; // 긴급 아닌 기도는 무시

    const db      = admin.firestore();
    const author  = data.author || '익명';
    const text    = data.text   || '';
    const preview = text.length > 60 ? text.slice(0, 60) + '…' : text;

    const tokenSnap = await db.collection('fcmTokens')
      .where('enabled', '==', true)
      .get();

    if (tokenSnap.empty) return;

    const messages = [];
    tokenSnap.forEach(docSnap => {
      const d = docSnap.data();
      if (!d.token) return;
      messages.push({
        token: d.token,
        _uid: docSnap.id,
        notification: {
          title: `🚨 긴급 기도 요청 — ${author} 성도님`,
          body: preview,
        },
        webpush: {
          notification: {
            icon:  ICON_URL,
            badge: ICON_URL,
            requireInteraction: true,
            vibrate: [300, 100, 300, 100, 400],
          },
          fcmOptions: { link: `${APP_URL}/#/prayer-wall` }
        },
        data: { type: 'urgent_prayer', url: `${APP_URL}/#/prayer-wall` }
      });
    });

    console.log(`긴급 기도 알림 전송: ${messages.length}명`);
    await sendToAllTokens(db, messages);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// 3. 📢 교회 공지 알림 (churchAnnouncements 문서 생성 시 즉시 발송)
// ─────────────────────────────────────────────────────────────────────────────
exports.sendChurchAnnouncementNotification = functions.firestore.onDocumentCreated(
  'churchAnnouncements/{docId}',
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    const db      = admin.firestore();
    const title   = data.title   || '교회 공지';
    const content = data.content || data.body || '';
    const preview = content.length > 80 ? content.slice(0, 80) + '…' : content;

    const tokenSnap = await db.collection('fcmTokens')
      .where('enabled', '==', true)
      .get();

    if (tokenSnap.empty) return;

    const messages = [];
    tokenSnap.forEach(docSnap => {
      const d = docSnap.data();
      if (!d.token) return;
      messages.push({
        token: d.token,
        _uid: docSnap.id,
        notification: {
          title: `📢 [화도벧엘교회] ${title}`,
          body: preview,
        },
        webpush: {
          notification: {
            icon:  ICON_URL,
            badge: ICON_URL,
            requireInteraction: false,
          },
          fcmOptions: { link: `${APP_URL}/#/announce` }
        },
        data: { type: 'announcement', url: `${APP_URL}/#/announce` }
      });
    });

    console.log(`공지 알림 전송: ${messages.length}명`);
    await sendToAllTokens(db, messages);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// 4. 📡 관리자 전체 말씀 브로드캐스트 (broadcastNotifications 문서 생성 시)
// ─────────────────────────────────────────────────────────────────────────────
exports.sendBroadcastNotification = functions.firestore.onDocumentCreated(
  'broadcastNotifications/{docId}',
  async (event) => {
    const data = event.data?.data();
    if (!data) return;

    const db      = admin.firestore();
    const title   = data.title || '☀️ [화도벧엘교회] 오늘의 은혜로운 말씀';
    const body    = data.body  || '';
    const linkUrl = data.url   || APP_URL;

    const tokenSnap = await db.collection('fcmTokens')
      .where('enabled', '==', true)
      .get();

    if (tokenSnap.empty) return;

    const messages = [];
    tokenSnap.forEach(docSnap => {
      const d = docSnap.data();
      if (!d.token) return;
      messages.push({
        token: d.token,
        _uid: docSnap.id,
        notification: { title, body },
        webpush: {
          notification: {
            icon:  ICON_URL,
            badge: ICON_URL,
            requireInteraction: false,
            tag: `broadcast-${event.params.docId}`,
          },
          fcmOptions: { link: linkUrl }
        },
        data: { type: 'broadcast', url: linkUrl }
      });
    });

    console.log(`브로드캐스트 알림 전송: ${messages.length}명`);
    await sendToAllTokens(db, messages);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// 5. 🔔 새 성도 가입 신청 → 관리자 즉시 알림
// ─────────────────────────────────────────────────────────────────────────────
exports.notifyAdminOnNewMember = functions.firestore.onDocumentCreated(
  'members/{uid}',
  async (event) => {
    const data = event.data?.data();
    if (!data) return;
    if (data.status !== 'pending') return; // 관리자 직접 등록은 알림 제외

    const db           = admin.firestore();
    const displayName  = data.displayName || '이름 미입력';
    const position     = data.position    || '직분 미입력';
    const district     = data.district    || '구역 미입력';

    // 관리자 토큰만 조회 (isAdmin 필드가 true인 경우)
    const tokenSnap = await db.collection('fcmTokens')
      .where('enabled', '==', true)
      .where('isAdmin', '==', true)
      .get();

    if (tokenSnap.empty) {
      console.log('관리자 토큰 없음 - 일반 토큰에서 관리자 찾는 폴백 시도');
      // 폴백: systemSettings에서 관리자 UID 목록 조회
      const settingsDoc = await db.doc('systemSettings/adminList').get();
      if (!settingsDoc.exists) return;

      const adminUids = settingsDoc.data()?.uids || [];
      if (adminUids.length === 0) return;

      const adminTokens = [];
      for (const uid of adminUids) {
        const tokenDoc = await db.collection('fcmTokens').doc(uid).get();
        if (tokenDoc.exists && tokenDoc.data()?.enabled && tokenDoc.data()?.token) {
          adminTokens.push({
            token: tokenDoc.data().token,
            _uid: uid,
          });
        }
      }

      if (adminTokens.length === 0) return;

      const messages = adminTokens.map(t => ({
        ...t,
        notification: {
          title: '👑 새 성도 가입 승인 요청',
          body: `${displayName} (${position} / ${district}) 성도님이 가입 승인을 기다리고 있습니다.`,
        },
        webpush: {
          notification: {
            icon:  ICON_URL,
            badge: ICON_URL,
            requireInteraction: true,
          },
          fcmOptions: { link: `${APP_URL}/#/admin` }
        },
        data: { type: 'new_member', url: `${APP_URL}/#/admin` }
      }));

      await sendToAllTokens(db, messages);
      return;
    }

    const messages = [];
    tokenSnap.forEach(docSnap => {
      const d = docSnap.data();
      if (!d.token) return;
      messages.push({
        token: d.token,
        _uid: docSnap.id,
        notification: {
          title: '👑 새 성도 가입 승인 요청',
          body: `${displayName} (${position} / ${district}) 성도님이 가입 승인을 기다리고 있습니다.`,
        },
        webpush: {
          notification: {
            icon:  ICON_URL,
            badge: ICON_URL,
            requireInteraction: true,
          },
          fcmOptions: { link: `${APP_URL}/#/admin` }
        },
        data: { type: 'new_member', url: `${APP_URL}/#/admin` }
      });
    });

    console.log(`관리자 가입 신청 알림: ${messages.length}명`);
    await sendToAllTokens(db, messages);
  }
);

// ─────────────────────────────────────────────────────────────────────────────
// 6. 🔴 생방송 시작 알림 (settings/liveStream isLive=true 변경 시)
// ─────────────────────────────────────────────────────────────────────────────
exports.sendLiveStreamNotification = functions.firestore.onDocumentWritten(
  'settings/liveStream',
  async (event) => {
    const afterData  = event.data?.after?.data();
    const beforeData = event.data?.before?.data();

    if (!afterData) return;
    // isLive가 false→true 로 바뀐 경우만 알림
    if (!afterData.isLive) return;
    if (beforeData?.isLive === true) return; // 이미 라이브 중이었으면 무시

    const db    = admin.firestore();
    const title = afterData.title    || '🔴 [화도벧엘교회] 실시간 예배 생중계';
    const body  = afterData.subtitle || '지금 화도벧엘교회 실시간 예배가 방송되고 있습니다. 함께 예배드려요!';

    const tokenSnap = await db.collection('fcmTokens')
      .where('enabled', '==', true)
      .get();

    if (tokenSnap.empty) return;

    const messages = [];
    tokenSnap.forEach(docSnap => {
      const d = docSnap.data();
      if (!d.token) return;
      messages.push({
        token: d.token,
        _uid: docSnap.id,
        notification: { title, body },
        webpush: {
          notification: {
            icon:  ICON_URL,
            badge: ICON_URL,
            requireInteraction: true,
            vibrate: [200, 100, 200, 100, 400],
            tag: 'live-stream',
          },
          fcmOptions: { link: `${APP_URL}/#/sermon` }
        },
        data: { type: 'live_stream', url: `${APP_URL}/#/sermon` }
      });
    });

    console.log(`생방송 알림 전송: ${messages.length}명`);
    await sendToAllTokens(db, messages);
  }
);
