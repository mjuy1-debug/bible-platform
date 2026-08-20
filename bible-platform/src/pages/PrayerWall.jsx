import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Plus, X, HandHeart, Trash2 } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, doc, increment, deleteDoc } from 'firebase/firestore';
import { UserContext } from '../context/UserContext';

import { messaging, getToken, VAPID_KEY } from '../services/firebase';
import { Bell, BellRing } from 'lucide-react';

export default function PrayerWall() {
  const { currentUser, showToast } = useContext(UserContext);
  const [prayers, setPrayers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPrayer, setNewPrayer] = useState({ text: '', verse: '', isAnonymous: false, isUrgent: false });
  const [pushRegistered, setPushRegistered] = useState(() => localStorage.getItem('push_enabled') === 'true');
  const [registeringPush, setRegisteringPush] = useState(false);

  // 긴급 알림 원클릭 등록
  const handleEnablePush = async () => {
    if (!('Notification' in window) || !('serviceWorker' in navigator)) {
      showToast('이 브라우저는 알림을 지원하지 않습니다.', 'error');
      return;
    }
    setRegisteringPush(true);
    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        showToast('알림 권한이 허용되지 않았습니다.', 'error');
        setRegisteringPush(false);
        return;
      }
      const swUrl = `${import.meta.env.BASE_URL}firebase-messaging-sw.js`;
      const swReg = await navigator.serviceWorker.register(swUrl);
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swReg
      });

      if (token) {
        const uid = currentUser?.uid || ('guest_' + (localStorage.getItem('guest_uid') || Date.now()));
        localStorage.setItem('guest_uid', uid);
        await setDoc(doc(db, 'fcmTokens', uid), {
          token,
          notifHour: 8,
          notifMinute: 0,
          enabled: true,
          displayName: currentUser?.displayName || '성도',
          updatedAt: new Date().toISOString()
        }, { merge: true });

        localStorage.setItem('push_enabled', 'true');
        setPushRegistered(true);
        showToast('🔔 긴급 기도 알림 수신이 활성화되었습니다! 🙏');
      }
    } catch (e) {
      console.error('알림 등록 오류:', e);
      showToast('알림 등록 중 오류가 발생했습니다.', 'error');
    }
    setRegisteringPush(false);
  };

  useEffect(() => {
    const q = query(
      collection(db, 'prayerWall'),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const p = snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
      // 최신순 정렬 (createdAt 내림차순)
      p.sort((a, b) => {
        const aTime = a.createdAt?.toDate?.()?.getTime() ?? 0;
        const bTime = b.createdAt?.toDate?.()?.getTime() ?? 0;
        return bTime - aTime;
      });
      setPrayers(p);
    }, (error) => {
      console.error('기도벽 로드 오류:', error);
    });

    return () => unsubscribe();
  }, []);

  const handlePostPrayer = async (e) => {
    e.preventDefault();
    if (!newPrayer.text.trim()) return;

    try {
      const authorName = newPrayer.isAnonymous 
        ? '익명' 
        : (currentUser?.displayName || '관리자');
      const authorId = currentUser?.uid || ('guest_' + Date.now());

      await addDoc(collection(db, 'prayerWall'), {
        text: newPrayer.text,
        verse: newPrayer.verse,
        author: authorName,
        authorId: authorId,
        isUrgent: newPrayer.isUrgent,
        prayCount: 0,
        createdAt: serverTimestamp()
      });
      setIsModalOpen(false);
      setNewPrayer({ text: '', verse: '', isAnonymous: false, isUrgent: false });
      if (showToast) showToast(newPrayer.isUrgent ? '🚨 긴급 기도가 올라갔습니다. 성도들에게 알림을 발송합니다!' : '기도가 올라갔습니다. 🙏');
    } catch (error) {
      console.error('기도 올리기 오류:', error);
      if (showToast) showToast(`오류: ${error.code || error.message}`);
    }
  };

  const handlePray = async (id) => {
    try {
      await updateDoc(doc(db, 'prayerWall', id), {
        prayCount: increment(1)
      });
    } catch (error) {
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("이 기도 제목을 삭제하시겠습니까?")) return;
    try {
      await deleteDoc(doc(db, 'prayerWall', id));
      if (showToast) showToast('삭제되었습니다.');
    } catch (error) {
      console.error(error);
      if (showToast) showToast('삭제 실패: 권한이 없습니다.');
    }
  };

  return (
    <div style={{ paddingBottom: '2rem', maxWidth: '820px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <HandHeart color="var(--accent-gold)" /> 중보 기도
        </h1>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ background: 'var(--accent-gold)', color: '#fff', border: 'none', borderRadius: '20px', padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer', fontWeight: 'bold' }}
        >
          <Plus size={18} /> 기도 올리기
        </button>
      </div>

      {/* 🔔 긴급 알림 수신 상태 배너 */}
      {!pushRegistered && (
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
          padding: '12px 16px', borderRadius: '12px', marginBottom: '16px',
          background: 'rgba(212, 175, 55, 0.1)', border: '1px solid rgba(212, 175, 55, 0.35)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BellRing color="var(--accent-gold)" size={20} />
            <div>
              <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: 'var(--text-primary)' }}>
                긴급 중보기도 푸시 알림 받기
              </p>
              <p style={{ margin: 0, fontSize: '11px', color: 'var(--text-secondary)' }}>
                새로운 긴급 기도가 등록되면 스마트폰으로 즉시 알림을 보내드립니다.
              </p>
            </div>
          </div>
          <button
            onClick={handleEnablePush}
            disabled={registeringPush}
            style={{
              padding: '6px 14px', borderRadius: '20px', background: 'var(--accent-gold)', color: '#1a1a2e',
              border: 'none', fontWeight: 700, fontSize: '12px', cursor: 'pointer', flexShrink: 0
            }}
          >
            {registeringPush ? '등록 중...' : '알림 켜기 🔔'}
          </button>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <AnimatePresence>
          {prayers.map((prayer) => (
            <motion.div 
              key={prayer.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              style={{
                background: prayer.isUrgent ? 'rgba(220,38,38,0.08)' : 'var(--glass-bg)',
                border: prayer.isUrgent ? '1px solid rgba(220,38,38,0.45)' : '1px solid var(--glass-border)',
                borderRadius: '12px', padding: '16px',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', alignItems: 'flex-start' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 'bold', color: 'var(--accent-gold)' }}>{prayer.author}</span>
                  {prayer.isUrgent && (
                    <span style={{
                      fontSize: '11px', fontWeight: 700, padding: '2px 8px', borderRadius: '99px',
                      background: 'rgba(220,38,38,0.18)', color: '#f87171', border: '1px solid rgba(220,38,38,0.4)',
                      display: 'inline-flex', alignItems: 'center', gap: '4px',
                    }}>
                      🚨 긴급
                    </span>
                  )}
                </div>
                <span style={{ fontSize: '12px', color: 'var(--text-secondary)', flexShrink: 0 }}>
                  {prayer.createdAt?.toDate ? prayer.createdAt.toDate().toLocaleDateString() : ''}
                </span>
              </div>
              <p style={{ lineHeight: '1.5', marginBottom: '12px', whiteSpace: 'pre-wrap', wordBreak: 'break-word', overflowWrap: 'anywhere' }}>{prayer.text}</p>
              {prayer.verse && (
                <div style={{ background: 'rgba(255,255,255,0.05)', padding: '8px 12px', borderRadius: '8px', fontSize: '14px', marginBottom: '12px', display: 'inline-block' }}>
                  📖 {prayer.verse}
                </div>
              )}
              
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px', flexWrap: 'wrap' }}>
                {(currentUser?.email?.includes('admin') || currentUser?.uid === prayer.authorId) && (
                  <button 
                    onClick={() => handleDelete(prayer.id)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid var(--text-secondary)', color: 'var(--text-secondary)', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer' }}
                  >
                    <Trash2 size={16} /> 삭제
                  </button>
                )}
                <button 
                  onClick={() => handlePray(prayer.id)}
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'transparent', border: '1px solid var(--accent-gold)', color: 'var(--accent-gold)', padding: '6px 12px', borderRadius: '20px', cursor: 'pointer' }}
                >
                  <Heart size={16} /> 기도했습니다 ({prayer.prayCount || 0})
                </button>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', display: 'flex', justifyContent: 'center', alignItems: 'center', zIndex: 1000, padding: '20px' }}
          >
            <motion.div 
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              style={{ background: 'var(--bg-secondary)', padding: '24px', borderRadius: '16px', width: '100%', maxWidth: '400px', border: '1px solid var(--glass-border)', maxHeight: '90vh', overflowY: 'auto' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2 style={{ fontSize: '18px', fontWeight: 'bold' }}>기도 제목 올리기</h2>
                <button onClick={() => setIsModalOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <X />
                </button>
              </div>
              
              <form onSubmit={handlePostPrayer} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <textarea 
                  required
                  placeholder="기도 제목을 나누어주세요..."
                  value={newPrayer.text}
                  onChange={(e) => setNewPrayer({...newPrayer, text: e.target.value})}
                  style={{ width: '100%', height: '100px', padding: '12px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', resize: 'none', boxSizing: 'border-box' }}
                />
                <input 
                  type="text"
                  placeholder="관련 말씀 구절 (선택)"
                  value={newPrayer.verse}
                  onChange={(e) => setNewPrayer({...newPrayer, verse: e.target.value})}
                  style={{ width: '100%', padding: '12px', borderRadius: '8px', background: 'var(--bg-primary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', boxSizing: 'border-box' }}
                />
                <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '14px', color: 'var(--text-secondary)' }}>
                  <input 
                    type="checkbox"
                    checked={newPrayer.isAnonymous}
                    onChange={(e) => setNewPrayer({...newPrayer, isAnonymous: e.target.checked})}
                  />
                  익명으로 올리기
                </label>

                {/* 긴급 체크박스 */}
                <label style={{
                  display: 'flex', alignItems: 'flex-start', gap: '10px', cursor: 'pointer',
                  padding: '12px', borderRadius: '10px',
                  background: newPrayer.isUrgent ? 'rgba(220,38,38,0.12)' : 'rgba(255,255,255,0.03)',
                  border: newPrayer.isUrgent ? '1px solid rgba(220,38,38,0.45)' : '1px solid var(--glass-border)',
                  transition: 'all 0.2s',
                }}>
                  <input 
                    type="checkbox"
                    checked={newPrayer.isUrgent}
                    onChange={(e) => setNewPrayer({...newPrayer, isUrgent: e.target.checked})}
                    style={{ marginTop: '2px', accentColor: '#ef4444' }}
                  />
                  <div>
                    <p style={{ fontSize: '14px', fontWeight: 700, color: newPrayer.isUrgent ? '#f87171' : 'var(--text-primary)', margin: 0 }}>
                      🚨 긴급 기도 요청
                    </p>
                    <p style={{ fontSize: '12px', color: 'var(--text-secondary)', margin: '3px 0 0', lineHeight: 1.5 }}>
                      체크 시 알림을 설정한 모든 성도에게 즉시 푸시 알림이 발송됩니다.
                    </p>
                  </div>
                </label>

                <button 
                  type="submit"
                  style={{
                    width: '100%', padding: '14px', borderRadius: '8px',
                    background: newPrayer.isUrgent ? '#dc2626' : 'var(--accent-gold)',
                    color: '#fff', border: 'none', fontWeight: 'bold', cursor: 'pointer',
                    fontSize: '15px', transition: 'background 0.2s',
                  }}
                >
                  {newPrayer.isUrgent ? '🚨 긴급 기도 올리기' : '올리기'}
                </button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
