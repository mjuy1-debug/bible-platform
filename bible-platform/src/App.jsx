import React from 'react';
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

  // 2. 실시간 긴급 기도 감시 (앱이 열려있거나 백그라운드 탭에 있을 때 즉시 감지 및 알림)
  useEffect(() => {
    const mountTime = new Date();
    const q = query(
      collection(db, 'prayerWall'),
      where('isUrgent', '==', true),
      orderBy('createdAt', 'desc'),
      limit(1)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      snapshot.docChanges().forEach((change) => {
        if (change.type === 'added') {
          const prayer = change.doc.data();
          const pDate = prayer.createdAt?.toDate ? prayer.createdAt.toDate() : new Date();
          // 앱 실행 시점 이후에 새로 올라온 긴급 기도인 경우 알림 발송
          if (pDate.getTime() >= mountTime.getTime() - 3000) {
            const title = `🚨 [긴급 기도] ${prayer.author || '익명'} 성도님의 기도 요청`;
            const body = prayer.text ? (prayer.text.length > 50 ? prayer.text.slice(0, 50) + '…' : prayer.text) : '기도제목을 확인하고 함께 기도해주세요.';
            
            showToast(`${title} - ${body}`);

            // 브라우저 알림 권한이 있으면 시스템 알림 팝업도 직접 띄움
            if ('Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification(title, {
                  body,
                  icon: 'https://mjuy1-debug.github.io/bible-platform/icon-192.png',
                  tag: `urgent-${change.doc.id}`,
                });
              } catch (e) {
                console.log('Direct notification fallback:', e);
              }
            }
          }
        }
      });
    }, (err) => {
      console.warn('긴급 기도 실시간 감시 알림:', err);
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
