import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Plus, X, HandHeart, Trash2, BellRing, BellOff } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, doc, increment, deleteDoc, setDoc } from 'firebase/firestore';
import { UserContext } from '../context/UserContext';
import { messaging, getToken, VAPID_KEY } from '../services/firebase';

export default function PrayerWall() {
  const { currentUser, showToast } = useContext(UserContext);
  const [prayers, setPrayers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPrayer, setNewPrayer] = useState({ text: '', verse: '', isAnonymous: false, isUrgent: false });
  const [pushRegistered, setPushRegistered] = useState(() => localStorage.getItem('push_enabled') === 'true');
  const [registeringPush, setRegisteringPush] = useState(false);

  const handleTogglePush = async () => {
    const uid = currentUser?.uid || ('guest_' + (localStorage.getItem('guest_uid') || Date.now()));
    localStorage.setItem('guest_uid', uid);
    if (pushRegistered) {
      setRegisteringPush(true);
      try {
        await setDoc(doc(db, 'fcmTokens', uid), { enabled: false, updatedAt: new Date().toISOString() }, { merge: true });
        localStorage.setItem('push_enabled', 'false');
        setPushRegistered(false);
        showToast('🔕 긴급 기도 알림이 해제되었습니다.');
      } catch (e) { showToast('알림 해제 중 오류가 발생했습니다.', 'error'); }
      setRegisteringPush(false);
    } else {
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        showToast('이 브라우저는 알림을 지원하지 않습니다.', 'error'); return;
      }
      setRegisteringPush(true);
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') { showToast('알림 권한이 거부되었습니다.', 'error'); setRegisteringPush(false); return; }
        const swUrl = `${import.meta.env.BASE_URL}firebase-messaging-sw.js`;
        const swReg = await navigator.serviceWorker.register(swUrl);
        const token = await getToken(messaging, { vapidKey: VAPID_KEY, serviceWorkerRegistration: swReg });
        if (token) {
          await setDoc(doc(db, 'fcmTokens', uid), {
            token, notifHour: 8, notifMinute: 0, enabled: true,
            displayName: currentUser?.displayName || '성도', updatedAt: new Date().toISOString()
          }, { merge: true });
          localStorage.setItem('push_enabled', 'true');
          setPushRegistered(true);
          showToast('🔔 긴급 기도 알림이 켜졌습니다! 🙏');
        } else { showToast('알림 토큰 발급에 실패했습니다.', 'error'); }
      } catch (e) { showToast(`알림 등록 오류: ${e.message || '다시 시도해주세요'}`, 'error'); }
      setRegisteringPush(false);
    }
  };

  useEffect(() => {
    const q = query(collection(db, 'prayerWall'), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const p = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      p.sort((a, b) => (b.createdAt?.toDate?.()?.getTime() ?? 0) - (a.createdAt?.toDate?.()?.getTime() ?? 0));
      setPrayers(p);
    }, (error) => { console.error('기도벽 로드 오류:', error); });
    return () => unsubscribe();
  }, []);

  const handlePostPrayer = async (e) => {
    e.preventDefault();
    if (!newPrayer.text.trim()) return;
    try {
      await addDoc(collection(db, 'prayerWall'), {
        text: newPrayer.text, verse: newPrayer.verse,
        author: newPrayer.isAnonymous ? '익명' : (currentUser?.displayName || '관리자'),
        authorId: currentUser?.uid || ('guest_' + Date.now()),
        isUrgent: newPrayer.isUrgent, prayCount: 0, createdAt: serverTimestamp()
      });
      setIsModalOpen(false);
      setNewPrayer({ text: '', verse: '', isAnonymous: false, isUrgent: false });
      if (showToast) showToast(newPrayer.isUrgent ? '🚨 긴급 기도가 올라갔습니다!' : '기도가 올라갔습니다. 🙏');
    } catch (error) {
      if (showToast) showToast(`오류: ${error.code || error.message}`);
    }
  };

  const handlePray = async (id) => {
    try { await updateDoc(doc(db, 'prayerWall', id), { prayCount: increment(1) }); } catch (e) { console.error(e); }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('이 기도 제목을 삭제하시겠습니까?')) return;
    try {
      await deleteDoc(doc(db, 'prayerWall', id));
      if (showToast) showToast('삭제되었습니다.');
    } catch (e) {
      if (showToast) showToast('삭제 실패: 권한이 없습니다.');
    }
  };

  return (
    <div style={{ paddingBottom: '3rem', maxWidth: '820px', margin: '0 auto' }}>
      {/* 헤더 */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '12px' }}>
        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
          <h1 style={{ fontSize: 'clamp(1.15rem, 5vw, 1.6rem)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', margin: 0, lineHeight: 1.3 }}>
            <HandHeart color="var(--accent-gold)" size={22} style={{ flexShrink: 0 }} />
            중보 기도
          </h1>
          <p style={{ fontSize: 'clamp(0.76rem, 2.8vw, 0.88rem)', color: 'var(--text-secondary)', marginTop: '6px', lineHeight: 1.65, wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
            성도들과 함께 기도 제목을 나누고, 서로를 위해 마음 모아 중보하는 기도 나눔터입니다.
          </p>
        </div>
        <button onClick={() => setIsModalOpen(true)} style={{ background: 'var(--accent-gold)', color: '#111', border: 'none', borderRadius: '20px', padding: 'clamp(7px,2vw,9px) clamp(12px,4vw,18px)', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontWeight: 'bold', flexShrink: 0, fontSize: 'clamp(0.8rem,2.5vw,0.9rem)', whiteSpace: 'nowrap' }}>
          <Plus size={15} /> 기도 올리기
        </button>
      </div>

      {/* 알림 배너 */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '10px', padding: 'clamp(10px,3vw,14px) clamp(12px,4vw,16px)', borderRadius: '14px', marginBottom: '20px', background: pushRegistered ? 'rgba(34,197,94,0.08)' : 'rgba(212,175,55,0.1)', border: pushRegistered ? '1px solid rgba(34,197,94,0.35)' : '1px solid rgba(212,175,55,0.35)', transition: 'all 0.2s' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', flex: '1 1 180px', minWidth: 0 }}>
          {pushRegistered ? <BellRing color="#4ade80" size={18} style={{ flexShrink: 0, marginTop: '2px' }} /> : <BellOff color="var(--accent-gold)" size={18} style={{ flexShrink: 0, marginTop: '2px' }} />}
          <div style={{ minWidth: 0 }}>
            <p style={{ margin: 0, fontSize: 'clamp(0.76rem,2.5vw,0.82rem)', fontWeight: 700, color: pushRegistered ? '#4ade80' : 'var(--text-primary)', wordBreak: 'keep-all', overflowWrap: 'break-word' }}>
              {pushRegistered ? '🔔 긴급 기도 알림: 켜짐' : '🔕 긴급 기도 알림: 꺼짐'}
            </p>
            <p style={{ margin: '3px 0 0', fontSize: 'clamp(0.68rem,2.2vw,0.74rem)', color: 'var(--text-secondary)', wordBreak: 'keep-all', overflowWrap: 'break-word', lineHeight: 1.55 }}>
              {pushRegistered ? '긴급 기도 등록 시 즉시 알림이 울립니다.' : '알림을 켜시면 긴급 기도 등록 시 즉시 알림을 받습니다.'}
            </p>
          </div>
        </div>
        <button onClick={handleTogglePush} disabled={registeringPush} style={{ padding: 'clamp(6px,2vw,8px) clamp(12px,3.5vw,16px)', borderRadius: '20px', background: pushRegistered ? 'rgba(239,68,68,0.15)' : 'var(--accent-gold)', color: pushRegistered ? '#f87171' : '#1a1a2e', border: pushRegistered ? '1px solid rgba(239,68,68,0.35)' : 'none', fontWeight: 700, fontSize: 'clamp(0.72rem,2.2vw,0.8rem)', cursor: 'pointer', flexShrink: 0, whiteSpace: 'nowrap', transition: 'all 0.15s' }}>
          {registeringPush ? '처리 중...' : (pushRegistered ? '알림 끄기 🔕' : '알림 켜기 🔔')}
        </button>
      </div>

      {/* 기도 카드 목록 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <AnimatePresence>
          {prayers.map((prayer) => (
            <motion.div key={prayer.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }} style={{ background: prayer.isUrgent ? 'rgba(220,38,38,0.08)' : 'var(--glass-bg)', border: prayer.isUrgent ? '1px solid rgba(220,38,38,0.45)' : '1px solid var(--glass-border)', borderRadius: '14px', padding: 'clamp(12px,4vw,18px)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '10px', flexWrap: 'wrap', gap: '6px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '7px', flexWrap: 'wrap', minWidth: 0 }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-gold)', fontSize: 'clamp(0.82rem,2.8vw,0.94rem)' }}>{prayer.author}</span>
                  {prayer.isUrgent && (<span style={{ fontSize: 'clamp(0.66rem,2vw,0.74rem)', fontWeight: 700, padding: '2px 8px', borderRadius: '99px', background: 'rgba(220,38,38,0.18)', color: '#f87171', border: '1px solid rgba(220,38,38,0.4)', display: 'inline-flex', alignItems: 'center', gap: '3px', whiteSpace: 'nowrap', flexShrink: 0 }}>🚨 긴급</span>)}
                </div>
                <span style={{ fontSize: 'clamp(0.66rem,2vw,0.75rem)', color: 'var(--text-secondary)', flexShrink: 0, whiteSpace: 'nowrap' }}>{prayer.createdAt?.toDate ? prayer.createdAt.toDate().toLocaleDateString('ko-KR') : ''}</span>
              </div>
              <p style={{ lineHeight: 1.75, marginBottom: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere', fontSize: 'clamp(0.84rem,2.8vw,0.94rem)', color: 'var(--text-primary)' }}>{prayer.text}</p>
              {prayer.verse && (<div style={{ background: 'rgba(255,255,255,0.05)', padding: '7px 12px', borderRadius: '8px', fontSize: 'clamp(0.76rem,2.4vw,0.84rem)', marginBottom: '12px', display: 'inline-block', wordBreak: 'break-all', maxWidth: '100%' }}>📖 {prayer.verse}</div>)}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
                {(currentUser?.email?.includes('admin') || currentUser?.uid === prayer.authorId) && (
                  <button onClick={() => handleDelete(prayer.id)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', padding: 'clamp(5px,2vw,7px) clamp(10px,3vw,14px)', borderRadius: '20px', cursor: 'pointer', fontSize: 'clamp(0.73rem,2.3vw,0.82rem)', whiteSpace: 'nowrap' }}>
                    <Trash2 size={13} /> 삭제
                  </button>
                )}
                <button onClick={() => handlePray(prayer.id)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'transparent', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', padding: 'clamp(5px,2vw,7px) clamp(10px,3vw,14px)', borderRadius: '20px', cursor: 'pointer', fontSize: 'clamp(0.73rem,2.3vw,0.82rem)', whiteSpace: 'nowrap' }}>
                  <Heart size={13} /> 기도했습니다 ({prayer.prayCount || 0})
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {prayers.length === 0 && (<div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-secondary)', fontSize: 'clamp(0.85rem,3vw,0.95rem)' }}>🙏 아직 기도 제목이 없습니다. 첫 번째로 올려보세요!</div>)}
      </div>

      {/* 기도 올리기 모달 (바텀 시트) */}
      <AnimatePresence>
        {isModalOpen && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.75)', display: 'flex', justifyContent: 'center', alignItems: 'flex-end', zIndex: 1000 }} onClick={(e) => { if (e.target === e.currentTarget) setIsModalOpen(false); }}>
            <motion.div initial={{ y: '100%' }} animate={{ y: 0 }} exit={{ y: '100%' }} transition={{ type: 'spring', damping: 30, stiffness: 300 }} style={{ background: 'var(--bg-secondary)', padding: 'clamp(16px,5vw,28px)', borderRadius: '24px 24px 0 0', width: '100%', maxWidth: '560px', margin: '0 auto', border: '1px solid var(--glass-border)', borderBottom: 'none', maxHeight: '90vh', overflowY: 'auto' }}>
              <div style={{ width: '36px', height: '4px', borderRadius: '2px', background: 'rgba(255,255,255,0.2)', margin: '0 auto 16px' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: 'clamp(1rem,4vw,1.2rem)', fontWeight: 'bold', margin: 0 }}>🙏 기도 제목 올리기</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }}><X size={22} /></button>
              </div>
              <form onSubmit={handlePostPrayer} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <textarea required placeholder="기도 제목을 나누어주세요..." value={newPrayer.text} onChange={(e) => setNewPrayer({ ...newPrayer, text: e.target.value })} style={{ width: '100%', minHeight: '110px', padding: '12px', borderRadius: '10px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', resize: 'vertical', boxSizing: 'border-box', fontSize: 'clamp(0.85rem,3vw,0.95rem)', lineHeight: 1.65 }} />
                <input type="text" placeholder="관련 말씀 구절 (선택 · 예: 시편 46:1)" value={newPrayer.verse} onChange={(e) => setNewPrayer({ ...newPrayer, verse: e.target.value })} style={{ width: '100%', padding: '12px', borderRadius: '10px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', boxSizing: 'border-box', fontSize: 'clamp(0.85rem,3vw,0.92rem)' }} />
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: 'clamp(0.82rem,2.8vw,0.9rem)', color: 'var(--text-secondary)' }}>
                  <input type="checkbox" checked={newPrayer.isAnonymous} onChange={(e) => setNewPrayer({ ...newPrayer, isAnonymous: e.target.checked })} style={{ width: '16px', height: '16px', flexShrink: 0 }} />
                  익명으로 올리기
                </label>
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer', padding: 'clamp(10px,3vw,14px)', borderRadius: '12px', background: newPrayer.isUrgent ? 'rgba(220,38,38,0.12)' : 'rgba(255,255,255,0.03)', border: newPrayer.isUrgent ? '1px solid rgba(220,38,38,0.45)' : '1px solid var(--glass-border)', transition: 'all 0.2s' }}>
                  <input type="checkbox" checked={newPrayer.isUrgent} onChange={(e) => setNewPrayer({ ...newPrayer, isUrgent: e.target.checked })} style={{ marginTop: '3px', accentColor: '#ef4444', width: '16px', height: '16px', flexShrink: 0 }} />
                  <div>
                    <p style={{ fontSize: 'clamp(0.85rem,2.8vw,0.92rem)', fontWeight: 700, color: newPrayer.isUrgent ? '#f87171' : 'var(--text-primary)', margin: 0 }}>🚨 긴급 기도 요청</p>
                    <p style={{ fontSize: 'clamp(0.72rem,2.3vw,0.78rem)', color: 'var(--text-secondary)', margin: '4px 0 0', lineHeight: 1.55, wordBreak: 'keep-all' }}>체크 시 알림을 설정한 모든 성도에게 즉시 푸시 알림이 발송됩니다.</p>
                  </div>
                </label>
                <button type="submit" style={{ width: '100%', padding: 'clamp(12px,3.5vw,15px)', borderRadius: '10px', background: newPrayer.isUrgent ? '#dc2626' : 'var(--accent-gold)', color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer', fontSize: 'clamp(0.9rem,3vw,1rem)', transition: 'background 0.2s' }}>
                  {newPrayer.isUrgent ? '🚨 긴급 기도 올리기' : '🙏 기도 올리기'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}