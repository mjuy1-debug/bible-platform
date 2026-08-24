import React, { useContext, useEffect, useState } from 'react';
import { HashRouter as Router, Routes, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import BottomNav from './components/BottomNav';
import Toast from './components/Toast';
import Home from './pages/Home';
import Read from './pages/Read';
import Devotion from './pages/Devotion';
import AiAssistant from './pages/AiAssistant';
import Plan from './pages/Plan';
import Schedule from './pages/Schedule';
import Profile from './pages/Profile';
import Search from './pages/Search';
import Favorites from './pages/Favorites';
import Sermons from './pages/Sermons';
import VerseCard from './pages/VerseCard';
import Prayer from './pages/Prayer';
import PrayerWall from './pages/PrayerWall';
import Groups from './pages/Groups';
import Bulletin from './pages/Bulletin';
import Memorize from './pages/Memorize';
import BibleMap from './pages/BibleMap';
import Hymns from './pages/Hymns';
import Stats from './pages/Stats';
import Quiz from './pages/Quiz';
import Announce from './pages/Announce';
import AdminDashboard from './pages/AdminDashboard';
import ApprovalPending from './components/ApprovalPending';
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider, UserContext } from './context/UserContext';
import { messaging, onMessage, db } from './services/firebase';
import { collection, doc, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';

const AppInner = () => {
  const { toast, showToast, currentUser, memberStatus, memberProfile, updateMemberProfile, loginWithGoogle } = useContext(UserContext);
  const [showProfileEdit, setShowProfileEdit] = useState(false);
  const [profileForm, setProfileForm] = useState({ position: '', district: '' });

  // ── 직분/구역 수정 모달 ──
  const ProfileEditModal = () => (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1.5rem',
    }}>
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
        borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '380px',
      }}>
        <h3 style={{ color: 'var(--accent-gold)', marginBottom: '1.5rem', textAlign: 'center' }}>✏️ 직분 / 구역 입력</h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <select value={profileForm.position} onChange={e => setProfileForm(p => ({ ...p, position: e.target.value }))} style={{
            background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
            borderRadius: '10px', padding: '0.7rem 1rem', color: 'var(--text-primary)', fontSize: '0.95rem',
          }}>
            <option value="">직분 선택</option>
            {['성도','집사','권사','장로','전도사','목사','사모','청년','어린이/청소년'].map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
          <input
            value={profileForm.district}
            onChange={e => setProfileForm(p => ({ ...p, district: e.target.value }))}
            placeholder="구역 입력 (예: 1구역, 청년부)"
            style={{
              background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
              borderRadius: '10px', padding: '0.7rem 1rem', color: 'var(--text-primary)', fontSize: '0.95rem',
            }}
          />
          <button onClick={async () => {
            await updateMemberProfile(profileForm);
            setShowProfileEdit(false);
          }} style={{
            background: 'linear-gradient(135deg, var(--accent-gold), #b8860b)',
            border: 'none', borderRadius: '12px', color: '#1a1400',
            padding: '0.8rem', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
          }}>
            저장하기
          </button>
          <button onClick={() => setShowProfileEdit(false)} style={{
            background: 'transparent', border: '1px solid var(--glass-border)',
            borderRadius: '12px', color: 'var(--text-secondary)', padding: '0.8rem', cursor: 'pointer',
          }}>취소</button>
        </div>
      </div>
    </div>
  );

  // ── 접근 게이트 ──

  // 1. 로그인 안 된 상태: 로그인 화면
  if (!currentUser) {
    return (
      <>
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
          background: 'var(--bg-primary)', padding: '2rem 1.5rem', textAlign: 'center',
        }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✝️</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>
            벧엘교회 말씀 플랫폼
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.95rem', lineHeight: 1.6 }}>
            벧엘교회 성도 전용 앱입니다.<br />
            로그인 후 관리자 승인 시 이용 가능합니다.
          </p>
          <button onClick={loginWithGoogle} style={{
            display: 'flex', alignItems: 'center', gap: '0.75rem',
            background: '#fff', color: '#333', borderRadius: '14px',
            padding: '0.9rem 2rem', fontSize: '1rem', fontWeight: 600,
            border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
          }}>
            <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '20px', height: '20px' }} />
            Google 계정으로 로그인
          </button>
          <p style={{ marginTop: '3rem', fontSize: '0.78rem', color: 'var(--text-secondary)', opacity: 0.5 }}>
            문의: 교회 사무실 또는 담당 교역자
          </p>
        </div>
        {toast && <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', background: '#333', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '999px', zIndex: 9999 }}>{toast.message}</div>}
      </>
    );
  }

  // 2. 승인 상태 로딩 중
  if (memberStatus === null) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
        ⏳ 승인 상태 확인 중...
      </div>
    );
  }

  // 3. 승인 대기 / 거부 상태
  if (memberStatus === 'pending' || memberStatus === 'rejected') {
    return (
      <>
        <ApprovalPending
          userProfile={memberProfile}
          onEditProfile={() => { setProfileForm({ position: memberProfile?.position || '', district: memberProfile?.district || '' }); setShowProfileEdit(true); }}
        />
        {showProfileEdit && <ProfileEditModal />}
        {toast && <div style={{ position: 'fixed', bottom: '2rem', left: '50%', transform: 'translateX(-50%)', background: '#333', color: '#fff', padding: '0.75rem 1.5rem', borderRadius: '999px', zIndex: 9999 }}>{toast.message}</div>}
      </>
    );
  }



  // 0. 브라우저 첫 터치 시 오디오 자동재생 잠금 해제 (알림 수신 시 즉시 소리 재생 가능하도록)
  useEffect(() => {
    const unlockAudio = () => {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx && !window.__globalAudioCtx) {
          window.__globalAudioCtx = new AudioCtx();
        }
        if (window.__globalAudioCtx && window.__globalAudioCtx.state === 'suspended') {
          window.__globalAudioCtx.resume();
        }
      } catch (e) {}
    };

    window.addEventListener('click', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    return () => {
      window.removeEventListener('click', unlockAudio);
      window.removeEventListener('touchstart', unlockAudio);
    };
  }, []);

  // 1. FCM 포그라운드 푸시 수신
  useEffect(() => {
    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        if (payload.notification) {
          showToast(`${payload.notification.title} - ${payload.notification.body}`);
        }
      });
      return () => unsubscribe();
    }
  }, [showToast]);

  // 2. 실시간 긴급 기도 감시 (인덱스 에러 없이 동작 + 모바일 서비스워커 알림 + 소리/진동)
  useEffect(() => {
    let isInitialLoad = true;
    const q = query(
      collection(db, 'prayerWall'),
      orderBy('createdAt', 'desc'),
      limit(10)
    );

    // 알림 소리 재생 함수 (Web Audio API)
    const playChime = () => {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = window.__globalAudioCtx || new AudioCtx();
        if (ctx.state === 'suspended') ctx.resume();

        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(659.25, now);        // E5
        osc1.frequency.setValueAtTime(880, now + 0.15);    // A5
        osc1.frequency.setValueAtTime(1174.66, now + 0.3); // D6

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(659.25, now);
        osc2.frequency.setValueAtTime(880, now + 0.15);
        osc2.frequency.setValueAtTime(1174.66, now + 0.3);

        gain.gain.setValueAtTime(0.4, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 1.0);
        osc2.stop(now + 1.0);
      } catch (e) {
        console.log('Audio chime error:', e);
      }
    };

    const triggerSystemNotification = (title, body, docId) => {
      if ('Notification' in window && Notification.permission === 'granted') {
        const notifOptions = {
          body,
          icon: 'https://mjuy1-debug.github.io/bible-platform/icon-192.png',
          badge: 'https://mjuy1-debug.github.io/bible-platform/icon-192.png',
          tag: `urgent-${docId}`,
          vibrate: [300, 100, 300, 100, 300],
          silent: false,
          renotify: true,
          requireInteraction: true,
          data: { url: '/#/prayer-wall' }
        };

        // 모바일 크롬 지원: ServiceWorkerRegistration.showNotification 우선 사용
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then((reg) => {
            reg.showNotification(title, notifOptions);
          }).catch(() => {
            try { new Notification(title, notifOptions); } catch (e) {}
          });
        } else {
          try { new Notification(title, notifOptions); } catch (e) {}
        }
      }
    };

    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isInitialLoad) {
        isInitialLoad = false;
        // 앱을 처음 열었을 때도, 최근 12시간 이내에 올라온 긴급 기도가 있으면 확인 여부 체크 후 1회 알림
        const recentUrgent = snapshot.docs.map(d => ({ id: d.id, ...d.data() })).find(p => p.isUrgent);
        if (recentUrgent) {
          const pTime = recentUrgent.createdAt?.toDate ? recentUrgent.createdAt.toDate().getTime() : 0;
          const twelveHoursAgo = Date.now() - (12 * 60 * 60 * 1000);
          const lastSeenId = localStorage.getItem('last_seen_urgent_id');

          if (pTime > twelveHoursAgo && lastSeenId !== recentUrgent.id) {
            localStorage.setItem('last_seen_urgent_id', recentUrgent.id);
            const title = `🚨 [긴급 기도] ${recentUrgent.author || '익명'} 성도님의 기도 요청`;
            const body = recentUrgent.text ? (recentUrgent.text.length > 50 ? recentUrgent.text.slice(0, 50) + '…' : recentUrgent.text) : '기도제목을 확인하고 함께 기도해주세요.';
            
            showToast(`${title} - ${body}`, 'error');
            playChime();
            triggerSystemNotification(title, body, recentUrgent.id);
          }
        }
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const prayer = change.doc.data();
          // 실시간으로 새로 등록된 긴급 기도 알림 발송
          if (prayer.isUrgent) {
            localStorage.setItem('last_seen_urgent_id', change.doc.id);
            const title = `🚨 [긴급 기도] ${prayer.author || '익명'} 성도님의 기도 요청`;
            const body = prayer.text ? (prayer.text.length > 50 ? prayer.text.slice(0, 50) + '…' : prayer.text) : '기도제목을 확인하고 함께 기도해주세요.';

            // 1. 화면 내 강조 토스트
            showToast(`${title} - ${body}`, 'error');

            // 2. 맑은 차임벨 소리 & 진동
            playChime();
            if ('vibrate' in navigator) navigator.vibrate([300, 100, 300, 100, 300]);

            // 3. 브라우저/모바일 시스템 푸시 알림
            triggerSystemNotification(title, body, change.doc.id);
          }
        }
      });
    }, (err) => {
      console.warn('긴급 기도 실시간 감시 오류:', err);
    });

    return () => unsubscribe();
  }, [showToast]);

  // 3. 교회 전체 공지 실시간 감시 (관리자가 올리면 즉시 토스트 + 시스템 알림)
  useEffect(() => {
    let isInitialLoad = true;
    const q = query(
      collection(db, 'churchAnnouncements'),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubAnnounce = onSnapshot(q, (snapshot) => {
      if (isInitialLoad) {
        isInitialLoad = false;
        return;
      }
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const data = change.doc.data();
          const title = data.title || '교회 공지';
          const body = data.body || '';
          const preview = body.length > 60 ? body.slice(0, 60) + '…' : body;
          showToast(`📢 [교회 공지] ${title} — ${preview}`);
          if ('Notification' in window && Notification.permission === 'granted') {
            const notifOptions = {
              body: preview,
              icon: 'https://mjuy1-debug.github.io/bible-platform/icon-192.png',
              tag: `announce-${change.doc.id}`,
              requireInteraction: false,
              data: { url: '/#/announce' }
            };
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.ready.then(reg => reg.showNotification(`📢 ${title}`, notifOptions)).catch(() => {
                try { new Notification(`📢 ${title}`, notifOptions); } catch (e) {}
              });
            } else {
              try { new Notification(`📢 ${title}`, notifOptions); } catch (e) {}
            }
          }
        }
      });
    }, (err) => console.warn('공지 감시 오류:', err));

    return () => unsubAnnounce();
  }, [showToast]);

  // 4. 실시간 생방송 알림 감시 (관리자가 방송 알림을 체크하여 발송했을 때만 전교인에게 푸시 + 차임벨)
  useEffect(() => {
    let isInitial = true;
    const unsubLive = onSnapshot(doc(db, 'settings', 'liveStream'), (snap) => {
      if (isInitial) {
        isInitial = false;
        // 앱을 켰을 때, 최근 15분 이내에 알림이 발송되었고 아직 확인하지 않은 알림이면 1회 띄움
        if (snap.exists()) {
          const data = snap.data();
          if (data.isLive && data.notificationId) {
            const notifTime = data.notificationTriggeredAt || 0;
            const fifteenMinutesAgo = Date.now() - (15 * 60 * 1000);
            const lastSeenNotifId = localStorage.getItem('last_seen_live_notif_id');
            if (notifTime > fifteenMinutesAgo && lastSeenNotifId !== String(data.notificationId)) {
              localStorage.setItem('last_seen_live_notif_id', String(data.notificationId));
              const title = data.title || '🔴 [생방송] 실시간 예배 중계';
              const body = data.subtitle || '지금 벧엘교회 실시간 예배가 방송되고 있습니다. 참여하세요!';
              showToast(`${title} — ${body}`);
              if ('Notification' in window && Notification.permission === 'granted') {
                const notifOptions = {
                  body,
                  icon: 'https://mjuy1-debug.github.io/bible-platform/icon-192.png',
                  badge: 'https://mjuy1-debug.github.io/bible-platform/icon-192.png',
                  tag: `live-${data.notificationId}`,
                  vibrate: [200, 100, 200, 100, 400],
                  renotify: true,
                  requireInteraction: true,
                  data: { url: '/' }
                };
                if ('serviceWorker' in navigator) {
                  navigator.serviceWorker.ready.then(reg => reg.showNotification(title, notifOptions)).catch(() => {
                    try { new Notification(title, notifOptions); } catch (e) {}
                  });
                } else {
                  try { new Notification(title, notifOptions); } catch (e) {}
                }
              }
            }
          }
        }
        return;
      }

      if (snap.exists()) {
        const data = snap.data();
        // isLive 상태이고, notificationId가 새로 발송된 경우에만 알림 발송
        if (data.isLive && data.notificationId) {
          const lastSeenNotifId = localStorage.getItem('last_seen_live_notif_id');
          if (lastSeenNotifId !== String(data.notificationId)) {
            localStorage.setItem('last_seen_live_notif_id', String(data.notificationId));
            const title = data.title || '🔴 [생방송] 실시간 예배 중계';
            const body = data.subtitle || '지금 벧엘교회 실시간 예배가 방송되고 있습니다. 참여하세요!';
            
            // 1. 화면 내 강조 토스트
            showToast(`${title} — ${body}`);

            // 2. 맑은 차임벨 소리 & 진동
            try {
              const AudioContext = window.AudioContext || window.webkitAudioContext;
              if (AudioContext) {
                const ctx = new AudioContext();
                const now = ctx.currentTime;
                const osc = ctx.createOscillator();
                const gain = ctx.createGain();
                osc.type = 'sine';
                osc.frequency.setValueAtTime(523.25, now); // C5
                osc.frequency.setValueAtTime(659.25, now + 0.15); // E5
                osc.frequency.setValueAtTime(783.99, now + 0.3); // G5
                gain.gain.setValueAtTime(0.4, now);
                gain.gain.exponentialRampToValueAtTime(0.01, now + 1.0);
                osc.connect(gain);
                gain.connect(ctx.destination);
                osc.start(now);
                osc.stop(now + 1.0);
              }
            } catch (e) {}

            if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 400]);

            // 3. 브라우저/모바일 시스템 푸시 알림
            if ('Notification' in window && Notification.permission === 'granted') {
              const notifOptions = {
                body,
                icon: 'https://mjuy1-debug.github.io/bible-platform/icon-192.png',
                badge: 'https://mjuy1-debug.github.io/bible-platform/icon-192.png',
                tag: `live-${data.notificationId}`,
                vibrate: [200, 100, 200, 100, 400],
                renotify: true,
                requireInteraction: true,
                data: { url: '/' }
              };
              if ('serviceWorker' in navigator) {
                navigator.serviceWorker.ready.then(reg => reg.showNotification(title, notifOptions)).catch(() => {
                  try { new Notification(title, notifOptions); } catch (e) {}
                });
              } else {
                try { new Notification(title, notifOptions); } catch (e) {}
              }
            }
          }
        }
      }
    }, (err) => console.warn('라이브 방송 알림 감시 오류:', err));

    return () => unsubLive();
  }, [showToast]);

  return (
    <>
      <Navbar />
      <main style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: 'calc(var(--navbar-height) + 1.5rem) clamp(1rem, 3vw, 1.5rem) calc(var(--bottomnav-height) + env(safe-area-inset-bottom, 1rem))',
      }}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/read" element={<Read />} />
          <Route path="/devotion" element={<Devotion />} />
          <Route path="/ai" element={<AiAssistant />} />
          <Route path="/plan" element={<Plan />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/search" element={<Search />} />
          <Route path="/favorites" element={<Favorites />} />
          <Route path="/sermon" element={<Sermons />} />
          <Route path="/verse-card" element={<VerseCard />} />
          <Route path="/prayer" element={<Prayer />} />
          <Route path="/prayer-wall" element={<PrayerWall />} />
          <Route path="/groups" element={<Groups />} />
          <Route path="/bulletin" element={<Bulletin />} />
          <Route path="/memorize" element={<Memorize />} />
          <Route path="/bible-map" element={<BibleMap />} />
          <Route path="/hymns" element={<Hymns />} />
          <Route path="/stats" element={<Stats />} />
          <Route path="/quiz" element={<Quiz />} />
          <Route path="/announce" element={<Announce />} />
          <Route path="/admin" element={memberProfile?.isAdmin ? <AdminDashboard currentUser={currentUser} /> : <Home />} />
          <Route path="*" element={<Home />} />
        </Routes>
      </main>
      <BottomNav />
      {toast && <Toast message={toast.message} type={toast.type} />}
    </>
  );
};

function App() {
  return (
    <ThemeProvider>
      <UserProvider>
        <Router>
          <AppInner />
        </Router>
      </UserProvider>
    </ThemeProvider>
  );
}

export default App;
