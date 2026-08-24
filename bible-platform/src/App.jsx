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

// ── 독립 직분/구역 수정 모달 (입력 포커스 유지) ──
const ProfileEditModal = ({ initialName = '', initialPosition = '', initialDistrict = '', onSave, onClose }) => {
  const [name, setName] = useState(initialName);
  const [position, setPosition] = useState(initialPosition);
  const [district, setDistrict] = useState(initialDistrict);

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1.5rem',
      backdropFilter: 'blur(8px)',
    }}>
      <div style={{
        background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
        borderRadius: '20px', padding: '2rem', width: '100%', maxWidth: '380px',
        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
      }}>
        <h3 style={{ color: 'var(--accent-gold)', marginBottom: '1.25rem', textAlign: 'center', fontFamily: 'var(--font-serif)', fontSize: '1.3rem' }}>
          ✏️ 실명 및 직분 / 구역 입력
        </h3>
        <p style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1.25rem', textAlign: 'center', lineHeight: 1.5 }}>
          교회 성도 확인 및 빠른 승인을 위해<br />
          <strong style={{ color: '#ffd700' }}>실명(본명)</strong>과 <strong style={{ color: '#ffd700' }}>직분</strong>을 정확하게 입력해주세요.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
              성도 실명 (본명) *
            </label>
            <input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="예: 홍길동"
              style={{
                width: '100%', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                borderRadius: '10px', padding: '0.75rem 1rem', color: 'var(--text-primary)', fontSize: '0.95rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
              교회 직분
            </label>
            <select
              value={position}
              onChange={e => setPosition(e.target.value)}
              style={{
                width: '100%', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                borderRadius: '10px', padding: '0.75rem 1rem', color: 'var(--text-primary)', fontSize: '0.95rem',
              }}
            >
              <option value="">직분을 선택해주세요</option>
              {['성도', '집사', '권사', '장로', '전도사', '목사', '사모', '청년', '어린이/청소년'].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.35rem', fontWeight: 600 }}>
              소속 구역 / 부서
            </label>
            <input
              value={district}
              onChange={e => setDistrict(e.target.value)}
              placeholder="예: 1구역, 남선교회, 청년1부"
              style={{
                width: '100%', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                borderRadius: '10px', padding: '0.75rem 1rem', color: 'var(--text-primary)', fontSize: '0.95rem',
              }}
            />
          </div>

          <button
            onClick={() => onSave({ displayName: name.trim() || undefined, position, district })}
            style={{
              background: 'linear-gradient(135deg, var(--accent-gold), #b8860b)',
              border: 'none', borderRadius: '12px', color: '#1a1400',
              padding: '0.85rem', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
              marginTop: '0.5rem',
            }}
          >
            저장하기
          </button>
          <button
            onClick={onClose}
            style={{
              background: 'transparent', border: '1px solid var(--glass-border)',
              borderRadius: '12px', color: 'var(--text-secondary)', padding: '0.75rem', cursor: 'pointer',
            }}
          >
            취소
          </button>
        </div>
      </div>
    </div>
  );
};

const AppInner = () => {
  const { toast, showToast, currentUser, memberStatus, memberProfile, updateMemberProfile, loginWithGoogle } = useContext(UserContext);
  const [showProfileEdit, setShowProfileEdit] = useState(false);

  // ── 0. 오디오 잠금 해제 ──
  useEffect(() => {
    const unlockAudio = () => {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (AudioCtx && !window.__globalAudioCtx) window.__globalAudioCtx = new AudioCtx();
        if (window.__globalAudioCtx?.state === 'suspended') window.__globalAudioCtx.resume();
      } catch (e) {}
    };
    window.addEventListener('click', unlockAudio, { passive: true });
    window.addEventListener('touchstart', unlockAudio, { passive: true });
    return () => { window.removeEventListener('click', unlockAudio); window.removeEventListener('touchstart', unlockAudio); };
  }, []);

  // ── 1. FCM 포그라운드 푸시 수신 ──
  useEffect(() => {
    if (messaging) {
      const unsubscribe = onMessage(messaging, (payload) => {
        if (payload.notification) showToast(`${payload.notification.title} - ${payload.notification.body}`);
      });
      return () => unsubscribe();
    }
  }, [showToast]);

  // ── 2. 긴급 기도 실시간 감시 ──
  useEffect(() => {
    let isInitialLoad = true;
    const q = query(collection(db, 'prayerWall'), orderBy('createdAt', 'desc'), limit(10));
    const playChime = () => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(440, now);
          osc.frequency.setValueAtTime(554.37, now + 0.15);
          osc.frequency.setValueAtTime(659.25, now + 0.3);
          gain.gain.setValueAtTime(0.3, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
          osc.connect(gain); gain.connect(ctx.destination);
          osc.start(now); osc.stop(now + 1.2);
        }
      } catch (e) {}
    };
    const triggerSystemNotification = (title, body, tag) => {
      if ('Notification' in window && Notification.permission === 'granted') {
        const notifOptions = { body, icon: 'https://mjuy1-debug.github.io/bible-platform/icon-192.png', badge: 'https://mjuy1-debug.github.io/bible-platform/icon-192.png', tag, vibrate: [300, 100, 300], renotify: true, requireInteraction: true };
        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(reg => reg.showNotification(title, notifOptions)).catch(() => { try { new Notification(title, notifOptions); } catch (e) {} });
        } else { try { new Notification(title, notifOptions); } catch (e) {} }
      }
    };
    const unsubscribe = onSnapshot(q, (snapshot) => {
      if (isInitialLoad) {
        isInitialLoad = false;
        const recentUrgent = snapshot.docs.map(d => ({ id: d.id, ...d.data() })).find(p => p.isUrgent);
        if (recentUrgent) {
          const pTime = recentUrgent.createdAt?.toDate ? recentUrgent.createdAt.toDate().getTime() : 0;
          const twelveHoursAgo = Date.now() - (12 * 60 * 60 * 1000);
          const lastSeenId = localStorage.getItem('last_seen_urgent_id');
          if (pTime > twelveHoursAgo && lastSeenId !== recentUrgent.id) {
            localStorage.setItem('last_seen_urgent_id', recentUrgent.id);
            const title = `🚨 [긴급 기도] ${recentUrgent.author || '익명'} 성도님의 기도 요청`;
            const body = recentUrgent.text ? (recentUrgent.text.length > 50 ? recentUrgent.text.slice(0, 50) + '…' : recentUrgent.text) : '기도제목을 확인하고 함께 기도해주세요.';
            showToast(`${title} - ${body}`, 'error'); playChime(); triggerSystemNotification(title, body, recentUrgent.id);
          }
        }
        return;
      }
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const prayer = change.doc.data();
          if (prayer.isUrgent) {
            localStorage.setItem('last_seen_urgent_id', change.doc.id);
            const title = `🚨 [긴급 기도] ${prayer.author || '익명'} 성도님의 기도 요청`;
            const body = prayer.text ? (prayer.text.length > 50 ? prayer.text.slice(0, 50) + '…' : prayer.text) : '기도제목을 확인하고 함께 기도해주세요.';
            showToast(`${title} - ${body}`, 'error'); playChime();
            if ('vibrate' in navigator) navigator.vibrate([300, 100, 300, 100, 300]);
            triggerSystemNotification(title, body, change.doc.id);
          }
        }
      });
    }, err => console.warn('긴급 기도 실시간 감시 오류:', err));
    return () => unsubscribe();
  }, [showToast]);

  // ── 3. 교회 공지 실시간 감시 ──
  useEffect(() => {
    let isInitialLoad = true;
    const q = query(collection(db, 'churchAnnouncements'), orderBy('createdAt', 'desc'), limit(5));
    const unsubAnnounce = onSnapshot(q, snapshot => {
      if (isInitialLoad) { isInitialLoad = false; return; }
      snapshot.docChanges().forEach(change => {
        if (change.type === 'added') {
          const ann = change.doc.data();
          const title = ann.title || '📢 새로운 공지사항';
          const body = ann.content ? (ann.content.length > 60 ? ann.content.slice(0, 60) + '…' : ann.content) : '';
          showToast(`${title}${body ? ' — ' + body : ''}`);
          if ('Notification' in window && Notification.permission === 'granted') {
            const notifOptions = { body, icon: 'https://mjuy1-debug.github.io/bible-platform/icon-192.png', tag: `announce-${change.doc.id}`, requireInteraction: false };
            if ('serviceWorker' in navigator) {
              navigator.serviceWorker.ready.then(reg => reg.showNotification(`📢 ${title}`, notifOptions)).catch(() => { try { new Notification(`📢 ${title}`, notifOptions); } catch (e) {} });
            } else { try { new Notification(`📢 ${title}`, notifOptions); } catch (e) {} }
          }
        }
      });
    }, err => console.warn('공지 감시 오류:', err));
    return () => unsubAnnounce();
  }, [showToast]);

  // ── 4. 생방송 알림 감시 ──
  useEffect(() => {
    let isInitial = true;
    const unsubLive = onSnapshot(doc(db, 'settings', 'liveStream'), snap => {
      if (isInitial) {
        isInitial = false;
        if (snap.exists()) {
          const data = snap.data();
          if (data.isLive && data.notificationId) {
            const notifTime = data.notificationTriggeredAt || 0;
            const fifteenMinutesAgo = Date.now() - (15 * 60 * 1000);
            const lastSeenNotifId = localStorage.getItem('last_seen_live_notif_id');
            if (notifTime > fifteenMinutesAgo && lastSeenNotifId !== String(data.notificationId)) {
              localStorage.setItem('last_seen_live_notif_id', String(data.notificationId));
              const title = data.title || '🔴 [생방송] 실시간 예배 중계';
              const body = data.subtitle || '지금 벧엘교회 실시간 예배가 방송되고 있습니다.';
              showToast(`${title} — ${body}`);
            }
          }
        }
        return;
      }
      if (snap.exists()) {
        const data = snap.data();
        if (data.isLive && data.notificationId) {
          const lastSeenNotifId = localStorage.getItem('last_seen_live_notif_id');
          if (lastSeenNotifId !== String(data.notificationId)) {
            localStorage.setItem('last_seen_live_notif_id', String(data.notificationId));
            const title = data.title || '🔴 [생방송] 실시간 예배 중계';
            const body = data.subtitle || '지금 벧엘교회 실시간 예배가 방송되고 있습니다.';
            showToast(`${title} — ${body}`);
            if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 400]);
          }
        }
      }
    }, err => console.warn('라이브 방송 알림 감시 오류:', err));
    return () => unsubLive();
  }, [showToast]);

  // ── 5. 관리자 전용: 신규 성도 가입 신청 실시간 감시 (알림 + 차임벨 + 푸시) ──
  useEffect(() => {
    if (!memberProfile?.isAdmin) return;

    let isInitial = true;
    const q = query(
      collection(db, 'memberProfiles'),
      where('status', '==', 'pending'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    const playChime = () => {
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(523.25, now);       // C5
          osc.frequency.setValueAtTime(659.25, now + 0.15); // E5
          osc.frequency.setValueAtTime(783.99, now + 0.3);  // G5
          osc.frequency.setValueAtTime(1046.50, now + 0.45); // C6
          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 1.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 1.2);
        }
      } catch (e) {}
    };

    const triggerSystemNotification = (title, body, docId) => {
      if ('Notification' in window && Notification.permission === 'granted') {
        const notifOptions = {
          body,
          icon: 'https://mjuy1-debug.github.io/bible-platform/icon-192.png',
          badge: 'https://mjuy1-debug.github.io/bible-platform/icon-192.png',
          tag: `pending-member-${docId}`,
          vibrate: [200, 100, 200, 100, 300],
          renotify: true,
          requireInteraction: true,
          data: { url: '/#/admin' }
        };

        if ('serviceWorker' in navigator) {
          navigator.serviceWorker.ready.then(reg => reg.showNotification(title, notifOptions)).catch(() => {
            try { new Notification(title, notifOptions); } catch (e) {}
          });
        } else {
          try { new Notification(title, notifOptions); } catch (e) {}
        }
      }
    };

    const unsubPending = onSnapshot(q, (snapshot) => {
      if (isInitial) {
        isInitial = false;
        // 초기 로드 시 미승인 대기자가 있으면 관리자에게 1회 알림
        const count = snapshot.docs.length;
        if (count > 0) {
          const lastNotified = localStorage.getItem('last_notified_pending_count');
          if (lastNotified !== String(count)) {
            localStorage.setItem('last_notified_pending_count', String(count));
            showToast(`👑 [가입 승인 대기] ${count}명의 성도님이 승인을 기다리고 있습니다.`);
          }
        }
        return;
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const m = change.doc.data();
          const name = m.displayName || '새 성도';
          const pos = m.position ? `(${m.position})` : '';
          const title = `👑 [새 성도 가입 신청] ${name} ${pos}`;
          const body = `${m.email || ''} 성도님이 가입 승인을 요청했습니다. 지금 확인해주세요!`;

          showToast(title);
          playChime();
          if ('vibrate' in navigator) navigator.vibrate([200, 100, 200, 100, 300]);
          triggerSystemNotification(title, body, change.doc.id);
        }
      });
    }, (err) => console.warn('가입 신청 감시 오류:', err));

    return () => unsubPending();
  }, [memberProfile?.isAdmin, showToast]);

  // ── 로그인 안 된 상태 ──
  if (!currentUser) {
    return (
      <>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', padding: '2rem 1.5rem', textAlign: 'center' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>✝️</div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '0.5rem', fontFamily: 'var(--font-serif)' }}>벧엘교회 말씀 플랫폼</h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2.5rem', fontSize: '0.95rem', lineHeight: 1.6 }}>벧엘교회 성도 전용 앱입니다.<br />로그인 후 관리자 승인 시 이용 가능합니다.</p>
          <button onClick={loginWithGoogle} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', background: '#fff', color: '#333', borderRadius: '14px', padding: '0.9rem 2rem', fontSize: '1rem', fontWeight: 600, border: 'none', cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.3)' }}>
            <img src="https://www.google.com/favicon.ico" alt="Google" style={{ width: '20px', height: '20px' }} />
            Google 계정으로 로그인
          </button>
          <p style={{ marginTop: '3rem', fontSize: '0.78rem', color: 'var(--text-secondary)', opacity: 0.5 }}>문의: 교회 사무실 또는 담당 교역자</p>
        </div>
        {toast && <Toast message={toast.message} type={toast.type} />}
      </>
    );
  }

  // ── 승인 상태 로딩 중 ──
  if (memberStatus === null) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary)', color: 'var(--text-secondary)' }}>
        ⏳ 승인 상태 확인 중...
      </div>
    );
  }

  // ── 승인 대기 / 거부 상태 ──
  if (memberStatus === 'pending' || memberStatus === 'rejected') {
    return (
      <>
        <ApprovalPending
          userProfile={memberProfile}
          onEditProfile={() => setShowProfileEdit(true)}
        />
        {showProfileEdit && (
          <ProfileEditModal
            initialName={memberProfile?.displayName || currentUser?.displayName || ''}
            initialPosition={memberProfile?.position || ''}
            initialDistrict={memberProfile?.district || ''}
            onSave={async (data) => {
              await updateMemberProfile(data);
              setShowProfileEdit(false);
            }}
            onClose={() => setShowProfileEdit(false)}
          />
        )}
        {toast && <Toast message={toast.message} type={toast.type} />}
      </>
    );
  }

  // ── 승인된 사용자: 앱 전체 렌더 ──
  return (
    <>
      <Navbar />
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: 'calc(var(--navbar-height) + 1.5rem) clamp(1rem, 3vw, 1.5rem) calc(var(--bottomnav-height) + env(safe-area-inset-bottom, 1rem))' }}>
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
      {showProfileEdit && (
        <ProfileEditModal
          initialName={memberProfile?.displayName || currentUser?.displayName || ''}
          initialPosition={memberProfile?.position || ''}
          initialDistrict={memberProfile?.district || ''}
          onSave={async (data) => {
            await updateMemberProfile(data);
            setShowProfileEdit(false);
          }}
          onClose={() => setShowProfileEdit(false)}
        />
      )}
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
