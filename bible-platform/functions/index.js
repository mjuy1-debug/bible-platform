const functions = require('firebase-functions/v2');
const admin = require('firebase-admin');

admin.initializeApp();

/**
 * 매분 실행 - 각 사용자의 알림 시간과 현재 시간이 일치하면 FCM 푸시 알림 전송
 * 배포: firebase deploy --only functions
 * 
 * ⚠️ Firebase Blaze(유료) 플랜이 필요합니다
 */
exports.sendDailyDevotionNotifications = functions.scheduler.onSchedule(
  { schedule: 'every 1 minutes', timeZone: 'Asia/Seoul' },
  async () => {
    const db = admin.firestore();
    
    // 서버는 기본적으로 UTC(영국) 시간이므로 한국 시간(KST)으로 변환합니다.
    const now = new Date();
    const kstTime = new Date(now.getTime() + (9 * 60 * 60 * 1000));
    const currentHour = kstTime.getUTCHours();
    const currentMinute = kstTime.getUTCMinutes();

    // 현재 시간에 알림을 보내야 하는 사용자 조회
    const snapshot = await db.collection('fcmTokens')
      .where('enabled', '==', true)
      .where('notifHour', '==', currentHour)
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
            icon: 'https://mjuy1-debug.github.io/bible-platform/favicon.svg',
            badge: 'https://mjuy1-debug.github.io/bible-platform/favicon.svg',
            requireInteraction: false,
          },
          fcmOptions: {
            link: 'https://mjuy1-debug.github.io/bible-platform/'
          }
        }
      });
    });

    if (messages.length === 0) return;

    // 최대 500개씩 배치 전송
    const chunks = [];
    for (let i = 0; i < messages.length; i += 500) {
      chunks.push(messages.slice(i, i + 500));
    }

    for (const chunk of chunks) {
      const result = await admin.messaging().sendEach(chunk);
      console.log(`전송 완료: 성공 ${result.successCount}명 / 실패 ${result.failureCount}명`);

      // 유효하지 않은 토큰 정리
      result.responses.forEach((resp, idx) => {
        if (!resp.success && resp.error?.code === 'messaging/registration-token-not-registered') {
          const uid = snapshot.docs[idx]?.id;
          if (uid) {
            db.collection('fcmTokens').doc(uid).update({ enabled: false });
          }
        }
      });
    }
  }
);
