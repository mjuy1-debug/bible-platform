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

// 헬퍼: 안전한 시간 파싱
function parseHour(val, defaultH = 6) {
  if (val === undefined || val === null || val === '') return defaultH;
  const n = Number(val);
  return isNaN(n) ? defaultH : n;
}

function parseMinute(val, defaultM = 0) {
  if (val === undefined || val === null || val === '') return defaultM;
  const n = Number(val);
  return isNaN(n) ? defaultM : n;
}

// ─────────────────────────────────────────────────────────────────────────────
// 1. ☀️ 매일 아침 오늘의 말씀 알림
//    - 기본 시간: 오전 6시 (06:00 KST) 모든 사용자 일괄 발송
//    - 사용자 지정 시간: 해당 시간에 맞춤 발송
//    - 중복 발송 방지 (lastDailyVerseDate) 및 타입 불일치 방어
// ─────────────────────────────────────────────────────────────────────────────
exports.sendDailyVerseNotification = functions.scheduler.onSchedule(
  { schedule: 'every 5 minutes', timeZone: 'Asia/Seoul' },
  async () => {
    const db = admin.firestore();

    // 현재 한국 시간 (KST = UTC+9)
    const now = new Date();
    const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    const currentHour   = kstTime.getUTCHours();
    const currentMinute = kstTime.getUTCMinutes();
    const todayStr      = `${kstTime.getUTCFullYear()}-${String(kstTime.getUTCMonth() + 1).padStart(2, '0')}-${String(kstTime.getUTCDate()).padStart(2, '0')}`;

    // 오늘의 말씀 가져오기
    const verse = getTodayVerse(kstTime);

    // 활성 FCM 토큰 조회
    const snapshot = await db.collection('fcmTokens')
      .where('enabled', '==', true)
      .get();

    if (snapshot.empty) {
      return;
    }

    const messages = [];
    const targetDocIds = [];

    snapshot.forEach(docSnap => {
      const data = docSnap.data();
      if (!data.token) return;

      // 1) 주제 설정 확인 (기본값 true)
      if (data.topics && data.topics.dailyVerse === false) {
        return;
      }

      // 2) 오늘 이미 발송받았는지 확인 (중복 발송 완전 차단)
      if (data.lastDailyVerseDate === todayStr) {
        return;
      }

      // 3) 사용자 설정 시간 파싱 (미지정 시 기본 6시 0분)
      const userHour   = parseHour(data.notifHour, 6);
      const userMinute = parseMinute(data.notifMinute, 0);

      let isTimeToSend = false;

      // 기본 6시 사용자인 경우: 6시 대(06:00~06:59) 또는 6시 이후 아직 오늘 말씀을 못 받은 경우 발송
      if (userHour === 6) {
        if (currentHour === 6) {
          isTimeToSend = true;
        } else if (currentHour > 6 && !data.lastDailyVerseDate) {
          // 6시 이후에 등록되었거나 6시에 서버 지연 등으로 못 받은 기본 사용자에게 당일 1회 발송
          isTimeToSend = true;
        }
      } else {
        // 사용자가 6시가 아닌 특별한 시간을 지정한 경우: 해당 시간(±5분 창)에 발송
        if (userHour === currentHour && Math.abs(userMinute - currentMinute) < 5) {
          isTimeToSend = true;
        }
      }

      if (!isTimeToSend) {
        return;
      }

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
          date: todayStr
        }
      };
      messages.push(msg);
      targetDocIds.push(docSnap.id);
    });

    if (messages.length === 0) {
      return;
    }

    console.log(`[${currentHour}:${String(currentMinute).padStart(2,'0')} KST] 오늘의 말씀 알림 발송 대상: ${messages.length}명`);
    await sendToAllTokens(db, messages);

    // 발송 성공 기록 (당일 재발송 방지)
    const batch = db.batch();
    targetDocIds.forEach(id => {
      batch.set(db.collection('fcmTokens').doc(id), {
        lastDailyVerseDate: todayStr,
        lastDailyVerseSentAt: new Date().toISOString()
      }, { merge: true });
    });
    await batch.commit().catch(e => console.warn('발송 기록 업데이트 경고:', e.message));
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
// 5. 🔔 새 성도 가입 신청 → 관리자 즉시 백그라운드 푸시 알림
// ─────────────────────────────────────────────────────────────────────────────
const ADMIN_EMAILS = ['mjuy1@naver.com'];

exports.notifyAdminOnNewMember = functions.firestore.onDocumentWritten(
  'memberProfiles/{uid}',
  async (event) => {
    const afterData  = event.data?.after?.data();
    const beforeData = event.data?.before?.data();

    if (!afterData) return; // 문서 삭제 시 무시
    if (afterData.status !== 'pending') return; // approved/rejected 등은 무시

    // 이전에도 pending이었고 주요 정보 변경이 없는 단순 조회/터치면 중복 발송 방지
    const isNew = !beforeData;
    const isBecamePending = beforeData && beforeData.status !== 'pending';
    const infoUpdated = beforeData && (
      (beforeData.position !== afterData.position) ||
      (beforeData.district !== afterData.district) ||
      (beforeData.displayName !== afterData.displayName)
    );

    if (!isNew && !isBecamePending && !infoUpdated) {
      return;
    }

    const db           = admin.firestore();
    const displayName  = afterData.displayName || afterData.name || '성도';
    const position     = afterData.position    || '직분 미선택';
    const district     = afterData.district    || '구역 미선택';
    const email        = afterData.email       || '';

    console.log(`[가입 신청 감지] ${displayName} (${position} / ${district} / ${email})`);

    // 관리자 토큰 조회 (중복 제거용 Map)
    const adminTokens = new Map();

    // 1) fcmTokens에서 isAdmin == true인 토큰
    const snap1 = await db.collection('fcmTokens')
      .where('enabled', '==', true)
      .where('isAdmin', '==', true)
      .get();
    snap1.forEach(docSnap => {
      const d = docSnap.data();
      if (d.token) adminTokens.set(docSnap.id, d.token);
    });

    // 2) ADMIN_EMAILS 이메일을 가진 관리자 토큰
    for (const adminEmail of ADMIN_EMAILS) {
      const emailSnap = await db.collection('fcmTokens')
        .where('enabled', '==', true)
        .where('email', '==', adminEmail)
        .get();
      emailSnap.forEach(docSnap => {
        const d = docSnap.data();
        if (d.token) adminTokens.set(docSnap.id, d.token);
      });
    }

    // 3) memberProfiles에서 isAdmin == true인 관리자들의 UID 조회하여 fcmTokens 가져오기
    const adminProfilesSnap = await db.collection('memberProfiles')
      .where('isAdmin', '==', true)
      .get();
    for (const adminDoc of adminProfilesSnap.docs) {
      const tokenDoc = await db.collection('fcmTokens').doc(adminDoc.id).get();
      if (tokenDoc.exists && tokenDoc.data()?.enabled && tokenDoc.data()?.token) {
        adminTokens.set(adminDoc.id, tokenDoc.data().token);
      }
    }

    if (adminTokens.size === 0) {
      console.log('⚠️ 등록된 관리자 FCM 토큰이 없습니다. 관리자가 앱에서 [알림 켜기]를 활성화했는지 확인하세요.');
      return;
    }

    const messages = [];
    adminTokens.forEach((token, uid) => {
      messages.push({
        token,
        _uid: uid,
        notification: {
          title: '👑 [가입 승인 요청] 새 성도 가입',
          body: `${displayName} (${position} / ${district}) 성도님이 가입 승인을 요청했습니다.`,
        },
        webpush: {
          notification: {
            icon:  ICON_URL,
            badge: ICON_URL,
            requireInteraction: true,
            vibrate: [300, 150, 300, 150, 400],
            tag: `new-member-${event.params.uid}`,
          },
          fcmOptions: { link: `${APP_URL}/#/admin` }
        },
        data: {
          type: 'new_member',
          uid: event.params.uid,
          url: `${APP_URL}/#/admin`,
        }
      });
    });

    console.log(`관리자 가입 신청 백그라운드 푸시 전송: ${messages.length}대 기기`);
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

// ─────────────────────────────────────────────────────────────────────────────
// 7. 🚀 오늘의 말씀 즉시 발송 (수동 실행 / 테스트용 HTTP 엔드포인트)
// ─────────────────────────────────────────────────────────────────────────────
exports.sendDailyVerseNow = functions.https.onRequest(
  { cors: true },
  async (req, res) => {
    try {
      const db = admin.firestore();
      const now = new Date();
      const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
      const todayStr = `${kstTime.getUTCFullYear()}-${String(kstTime.getUTCMonth() + 1).padStart(2, '0')}-${String(kstTime.getUTCDate()).padStart(2, '0')}`;
      const verse = getTodayVerse(kstTime);

      const snapshot = await db.collection('fcmTokens')
        .where('enabled', '==', true)
        .get();

      if (snapshot.empty) {
        return res.json({ success: true, count: 0, message: '등록된 활성 토큰이 없습니다.' });
      }

      const messages = [];
      const targetDocIds = [];

      snapshot.forEach(docSnap => {
        const data = docSnap.data();
        if (!data.token) return;

        messages.push({
          token: data.token,
          _uid: docSnap.id,
          notification: {
            title: '☀️ [화도벧엘교회] 오늘의 말씀',
            body: `"${verse.text}" — ${verse.ref}`,
          },
          webpush: {
            notification: {
              icon: ICON_URL,
              badge: ICON_URL,
              requireInteraction: false,
              tag: `daily-verse-${todayStr}-${Date.now()}`,
              vibrate: [200, 100, 200],
            },
            fcmOptions: { link: APP_URL }
          },
          data: {
            type: 'daily_verse',
            verseText: verse.text,
            verseRef: verse.ref,
            url: APP_URL,
            date: todayStr
          }
        });
        targetDocIds.push(docSnap.id);
      });

      await sendToAllTokens(db, messages);

      // 발송 기록 업데이트
      const batch = db.batch();
      targetDocIds.forEach(id => {
        batch.set(db.collection('fcmTokens').doc(id), {
          lastDailyVerseDate: todayStr,
          lastDailyVerseSentAt: new Date().toISOString()
        }, { merge: true });
      });
      await batch.commit().catch(() => {});

      return res.json({
        success: true,
        count: messages.length,
        verse: `${verse.ref} - ${verse.text}`,
        date: todayStr
      });
    } catch (err) {
      console.error('수동 발송 오류:', err);
      return res.status(500).json({ success: false, error: err.message });
    }
  }
);

