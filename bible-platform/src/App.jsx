import React, { useContext, useEffect } from 'react';
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
import { ThemeProvider } from './context/ThemeContext';
import { UserProvider, UserContext } from './context/UserContext';
import { messaging, onMessage, db } from './services/firebase';
import { collection, query, where, onSnapshot, orderBy, limit } from 'firebase/firestore';

const AppInner = () => {
  const { toast, showToast } = useContext(UserContext);

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
    // 인덱스 에러 방지를 위해 orderBy 단일 쿼리만 사용 (isUrgent는 JS에서 필터)
    const q = query(
      collection(db, 'prayerWall'),
      orderBy('createdAt', 'desc'),
      limit(5)
    );

    // 알림 소리 재생 함수 (Web Audio API)
    const playChime = () => {
      try {
        const AudioCtx = window.AudioContext || window.webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        const now = ctx.currentTime;
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(587.33, now); // D5
        osc1.frequency.setValueAtTime(880, now + 0.15); // A5

        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(587.33, now);
        osc2.frequency.setValueAtTime(880, now + 0.15);

        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.8);

        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctx.destination);

        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.8);
        osc2.stop(now + 0.8);
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
          vibrate: [200, 100, 200],
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
        return; // 처음 앱 켤 때 기존에 있던 과거 글은 알림 울리지 않음
      }

      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const prayer = change.doc.data();
          // 긴급 기도만 알림 발송
          if (prayer.isUrgent) {
            const title = `🚨 [긴급 기도] ${prayer.author || '익명'} 성도님의 기도 요청`;
            const body = prayer.text ? (prayer.text.length > 50 ? prayer.text.slice(0, 50) + '…' : prayer.text) : '기도제목을 확인하고 함께 기도해주세요.';

            // 1. 화면 내 토스트
            showToast(`${title} - ${body}`);

            // 2. 맑은 차임벨 소리 & 진동
            playChime();
            if ('vibrate' in navigator) navigator.vibrate([200, 100, 200]);

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
