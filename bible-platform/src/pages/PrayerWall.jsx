import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Heart, Plus, X, HandHeart, Trash2 } from 'lucide-react';
import { db } from '../services/firebase';
import { collection, addDoc, onSnapshot, orderBy, query, serverTimestamp, updateDoc, doc, increment, deleteDoc, setDoc } from 'firebase/firestore';
import { UserContext } from '../context/UserContext';

import { messaging, getToken, VAPID_KEY } from '../services/firebase';
import { Bell, BellRing, BellOff } from 'lucide-react';

export default function PrayerWall() {
  const { currentUser, showToast } = useContext(UserContext);
  const [prayers, setPrayers] = useState([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newPrayer, setNewPrayer] = useState({ text: '', verse: '', isAnonymous: false, isUrgent: false });
  const [pushRegistered, setPushRegistered] = useState(() => localStorage.getItem('push_enabled') === 'true');
  const [registeringPush, setRegisteringPush] = useState(false);

  // 긴급 알림 켜기 / 끄기 토글
  const handleTogglePush = async () => {
    const uid = currentUser?.uid || ('guest_' + (localStorage.getItem('guest_uid') || Date.now()));
    localStorage.setItem('guest_uid', uid);

    if (pushRegistered) {
      // ── 알림 끄기 ──
      setRegisteringPush(true);
      try {
        await setDoc(doc(db, 'fcmTokens', uid), {
          enabled: false,
          updatedAt: new Date().toISOString()
        }, { merge: true });
        localStorage.setItem('push_enabled', 'false');
        setPushRegistered(false);
        showToast('🔕 긴급 기도 알림이 해제되었습니다.');
      } catch (e) {
        console.error('알림 끄기 오류:', e);
        showToast('알림 해제 중 오류가 발생했습니다.', 'error');
      }
      setRegisteringPush(false);
    } else {
      // ── 알림 켜기 ──
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        showToast('이 브라우저는 알림을 지원하지 않습니다.', 'error');
        return;
      }
      setRegisteringPush(true);
      try {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          showToast('알림 권한이 거부되었습니다. 브라우저 설정에서 허용해주세요.', 'error');
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
          showToast('🔔 긴급 기도 알림이 켜졌습니다! 🙏');
        } else {
          showToast('알림 토큰 발급에 실패했습니다.', 'error');
        }
      } catch (e) {
        console.error('알림 켜기 오류:', e);
        showToast(`알림 등록 오류: ${e.message || '다시 시도해주세요'}`, 'error');
      }
      setRegisteringPush(false);
    }
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px', flexWrap: 'wrap', gap: '1rem' }}>
        <div style={{ flex: '1 1 280px', minWidth: 0 }}>
          <h1 style={{ fontSize: 'clamp(1.3rem, 4.5vw, 1.6rem)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--text-primary)', margin: 0, lineHeight: 1.2 }}>
            <HandHeart color="var(--accent-gold)" /> 중보 기도
          </h1>
          <p style={{ fontSize: 'clamp(0.82rem, 2.5vw, 0.88rem)', color: 'var(--text-secondary)', marginTop: '0.4rem', lineHeight: 1.55, wordBreak: 'keep-all', overflowWrap: 'break-word', margin: '6px 0 0 0' }}>
            성도들과 함께 기도 제목을 나누고, 서로를 위해 마음 모아 중보하는 기도 나눔터입니다.
          </p>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          style={{ background: 'var(--accent-gold)', color: '#fff', border: 'none', borderRadius: '20px', padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '5px', cursor: 'pointer', fontWeight: 'bold', flexShrink: 0, marginTop: '2px' }}
        >
          <Plus size={18} /> 기도 올리기
        </button>
      </div>

      {/* 🔔 긴급 알림 수신 상태 배너 (켜기 / 끄기 토글 지원) */}
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px',
        padding: '12px 16px', borderRadius: '12px', marginBottom: '16px',
        background: pushRegistered ? 'rgba(34, 197, 94, 0.08)' : 'rgba(212, 175, 55, 0.1)',
        border: pushRegistered ? '1px solid rgba(34, 197, 94, 0.35)' : '1px solid rgba(212, 175, 55, 0.35)',
        transition: 'all 0.2s',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          {pushRegistered ? (
            <BellRing color="#4ade80" size={20} />
          ) : (
            <BellOff color="var(--accent-gold)" size={20} />
          )}
          <div>
            <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: pushRegistered ? '#4ade80' : 'var(--text-primary)' }}>
              {pushRegistered ? '🔔 긴급 기도 알림: 켜짐 (수신 중)' : '🔕 긴급 기도 알림: 꺼짐'}
            </p>
            <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
              {pushRegistered ? '새로운 긴급 기도가 올라오면 스마트폰으로 즉시 알림이 울립니다.' : '알림을 켜시면 긴급 기도 등록 시 스마트폰으로 알림을 받습니다.'}
            </p>
          </div>
        </div>

        <button
          onClick={handleTogglePush}
          disabled={registeringPush}
          style={{
            padding: '7px 16px', borderRadius: '20px',
            background: pushRegistered ? 'rgba(239, 68, 68, 0.15)' : 'var(--accent-gold)',
            color: pushRegistered ? '#f87171' : '#1a1a2e',
            border: pushRegistered ? '1px solid rgba(239, 68, 68, 0.35)' : 'none',
            fontWeight: 700, fontSize: '12px', cursor: 'pointer', flexShrink: 0,
            transition: 'all 0.15s',
          }}
        >
          {registeringPush 
            ? '처리 중...' 
            : (pushRegistered ? '알림 끄기 🔕' : '알림 켜기 🔔')}
        </button>
      </div>

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
