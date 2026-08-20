import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tv, Play, Settings, X, Save, ExternalLink } from 'lucide-react';
import { UserContext } from '../context/UserContext';
import { db } from '../services/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

// 기본 벧엘교회 유튜브 채널 라이브 URL
const DEFAULT_YOUTUBE_LIVE_URL = 'https://www.youtube.com/@bethelchurch/live';

export default function LiveBanner() {
  const { currentUser, showToast } = useContext(UserContext);
  const [isLiveTime, setIsLiveTime] = useState(false);
  const [liveInfo, setLiveInfo] = useState({ title: '', subtitle: '' });
  const [liveUrl, setLiveUrl] = useState(DEFAULT_YOUTUBE_LIVE_URL);
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState('');
  const [forceLive, setForceLive] = useState(false);

  const isAdmin = Boolean(
    currentUser && (
      currentUser.email?.includes('admin') || 
      currentUser.displayName?.includes('유정파파') ||
      currentUser.displayName?.includes('관리자')
    )
  );

  // Firestore에서 실시간 라이브 설정 동기화
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'liveStream'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        if (data.url) {
          setLiveUrl(data.url);
          setInputUrl(data.url);
        }
        if (data.forceLive !== undefined) {
          setForceLive(data.forceLive);
        }
      } else {
        setInputUrl(DEFAULT_YOUTUBE_LIVE_URL);
      }
    }, (err) => {
      console.warn('라이브 설정 불러오기:', err);
    });

    return () => unsub();
  }, []);

  // 예배 시간 스케줄 자동 감지
  useEffect(() => {
    const checkLiveSchedule = () => {
      const now = new Date();
      const day = now.getDay(); // 0: 일, 1: 월, 2: 화, 3: 수, 4: 목, 5: 금, 6: 토
      const hour = now.getHours();
      const minute = now.getMinutes();
      const timeVal = hour * 60 + minute;

      let live = false;
      let title = '';
      let subtitle = '';

      // 1. 주일 대예배 (일요일 09:00 ~ 13:30)
      if (day === 0 && timeVal >= 9 * 60 && timeVal <= 13 * 60 + 30) {
        live = true;
        title = '🔴 주일 대예배 생방송 중';
        subtitle = '지금 벧엘교회 주일 대예배가 실시간으로 방송되고 있습니다.';
      }
      // 2. 주일 오후예배 (일요일 13:30 ~ 15:30)
      else if (day === 0 && timeVal > 13 * 60 + 30 && timeVal <= 15 * 60 + 30) {
        live = true;
        title = '🔴 주일 오후 찬양예배 생방송 중';
        subtitle = '지금 주일 오후 찬양예배가 실시간으로 방송되고 있습니다.';
      }
      // 3. 수요 저녁예배 (수요일 19:00 ~ 21:30)
      else if (day === 3 && timeVal >= 19 * 60 && timeVal <= 21 * 60 + 30) {
        live = true;
        title = '🔴 수요 예배 생방송 중';
        subtitle = '지금 수요 저녁 예배가 실시간으로 방송되고 있습니다.';
      }
      // 4. 금요 심야기도회 (금요일 20:00 ~ 23:00)
      else if (day === 5 && timeVal >= 20 * 60 && timeVal <= 23 * 60) {
        live = true;
        title = '🔴 금요 심야기도회 생방송 중';
        subtitle = '지금 금요 심야 은혜기도회가 실시간으로 방송되고 있습니다.';
      }

      // 관리자 강제 라이브 활성화 여부
      if (forceLive) {
        live = true;
        title = title || '🔴 특별 예배 생방송 중';
        subtitle = subtitle || '지금 벧엘교회 실시간 예배가 방송되고 있습니다.';
      }

      setIsLiveTime(live);
      setLiveInfo({ title, subtitle });
    };

    checkLiveSchedule();
    const interval = setInterval(checkLiveSchedule, 60000);
    return () => clearInterval(interval);
  }, [forceLive]);

  // 관리자 설정 저장 (Firestore)
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    try {
      await setDoc(doc(db, 'settings', 'liveStream'), {
        url: inputUrl.trim(),
        forceLive: forceLive,
        updatedBy: currentUser?.displayName || '관리자',
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setLiveUrl(inputUrl.trim());
      setIsSettingOpen(false);
      if (showToast) showToast('✅ 실시간 예배 링크가 저장되어 모든 성도에게 적용되었습니다!');
    } catch (err) {
      console.error('라이브 설정 저장 오류:', err);
      if (showToast) showToast(`저장 오류: ${err.message}`, 'error');
    }
  };

  return (
    <>
      {/* 1. 관리자 전용 [라이브 링크 설정] 버튼 (예배 시간이 아닐 때도 관리자는 확인/수정 가능) */}
      {isAdmin && !isLiveTime && (
        <div style={{ maxWidth: '960px', margin: '0 auto 1rem', display: 'flex', justifyContent: 'flex-end' }}>
          <button
            onClick={() => setIsSettingOpen(true)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '6px 14px', borderRadius: '16px', background: 'rgba(212,175,55,0.1)',
              border: '1px solid rgba(212,175,55,0.3)', color: 'var(--accent-gold)',
              fontSize: '12px', fontWeight: 600, cursor: 'pointer'
            }}
          >
            <Settings size={13} /> 실시간 예배 링크 설정 (관리자)
          </button>
        </div>
      )}

      {/* 2. 예배 생방송 배너 (예배 시간이거나 강제 활성화 시 표시) */}
      <AnimatePresence>
        {isLiveTime && (
          <motion.div
            initial={{ opacity: 0, y: -15, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -15 }}
            style={{
              maxWidth: '960px',
              margin: '0 auto 1.5rem',
              padding: 'clamp(0.85rem, 2.5vw, 1.1rem) clamp(1rem, 3vw, 1.4rem)',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, rgba(220, 38, 38, 0.22) 0%, rgba(185, 28, 28, 0.12) 100%)',
              border: '1px solid rgba(239, 68, 68, 0.45)',
              boxShadow: '0 8px 25px rgba(220, 38, 38, 0.15)',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: '1 1 280px', minWidth: 0 }}>
              <div style={{
                position: 'relative',
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                background: '#dc2626',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
                flexShrink: 0,
                boxShadow: '0 0 15px rgba(239, 68, 68, 0.8)'
              }}>
                <Tv size={18} />
                <span style={{
                  position: 'absolute',
                  top: '-2px',
                  right: '-2px',
                  width: '10px',
                  height: '10px',
                  borderRadius: '50%',
                  background: '#ef4444',
                  border: '2px solid #fff',
                }} />
              </div>

              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                  <span style={{
                    background: '#dc2626', color: '#fff', fontSize: '11px', fontWeight: 800,
                    padding: '2px 8px', borderRadius: '99px', letterSpacing: '0.5px'
                  }}>
                    LIVE ON
                  </span>
                  <h3 style={{ margin: 0, fontSize: 'clamp(0.95rem, 2.5vw, 1.05rem)', fontWeight: 800, color: '#fff' }}>
                    {liveInfo.title}
                  </h3>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: 'clamp(0.78rem, 2vw, 0.84rem)', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.4, wordBreak: 'keep-all' }}>
                  {liveInfo.subtitle}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
              {isAdmin && (
                <button
                  onClick={() => setIsSettingOpen(true)}
                  style={{
                    background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.2)',
                    color: '#fff', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex'
                  }}
                  title="라이브 링크 수정"
                >
                  <Settings size={15} />
                </button>
              )}
              <a
                href={liveUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  background: '#dc2626',
                  color: '#fff',
                  padding: '8px 18px',
                  borderRadius: '24px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  textDecoration: 'none',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
                  transition: 'all 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.background = '#b91c1c'}
                onMouseOut={(e) => e.currentTarget.style.background = '#dc2626'}
              >
                <Play size={15} fill="#fff" /> 실시간 예배 참여하기
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 3. 관리자 라이브 링크 설정 모달 */}
      <AnimatePresence>
        {isSettingOpen && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{
              position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
              backgroundColor: 'rgba(0,0,0,0.75)', zIndex: 1200,
              display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '16px'
            }}
            onClick={() => setIsSettingOpen(false)}
          >
            <motion.div
              initial={{ scale: 0.95, y: 15 }} animate={{ scale: 1, y: 0 }} exit={{ scale: 0.95, y: 15 }}
              onClick={(e) => e.stopPropagation()}
              style={{
                background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
                borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '480px'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)' }}>
                  <Tv size={20} /> 실시간 예배 링크 설정
                </h3>
                <button onClick={() => setIsSettingOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                    유튜브 라이브 스트리밍 주소
                  </label>
                  <input
                    type="url"
                    required
                    value={inputUrl}
                    onChange={(e) => setInputUrl(e.target.value)}
                    placeholder="https://www.youtube.com/@채널이름/live"
                    style={{
                      width: '100%', padding: '12px', borderRadius: '10px',
                      background: 'var(--bg-primary)', border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)', fontSize: '14px', boxSizing: 'border-box'
                    }}
                  />
                  <p style={{ margin: '6px 0 0', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    💡 <strong>추천</strong>: 유튜브 채널 주소 뒤에 <code>/live</code>를 붙이면(예: <code>https://www.youtube.com/@bethelchurch/live</code>), 매주 링크를 바꾸지 않아도 생방송 시작 시 자동으로 최신 방송으로 연결됩니다.
                  </p>
                </div>

                {/* 강제 라이브 켜기 토글 (테스트 및 특별 집회용) */}
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '10px', padding: '12px',
                  borderRadius: '10px', background: forceLive ? 'rgba(220,38,38,0.1)' : 'rgba(255,255,255,0.03)',
                  border: forceLive ? '1px solid rgba(220,38,38,0.4)' : '1px solid var(--glass-border)',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={forceLive}
                    onChange={(e) => setForceLive(e.target.checked)}
                    style={{ accentColor: '#dc2626' }}
                  />
                  <div>
                    <p style={{ margin: 0, fontSize: '13px', fontWeight: 700, color: forceLive ? '#f87171' : 'var(--text-primary)' }}>
                      지금 즉시 라이브 배너 표시 (강제 켜기)
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '11px', color: 'var(--text-secondary)' }}>
                      체크 시 정규 예배 시간이 아니어도 홈 화면에 라이브 배너가 즉시 뜹니다.
                    </p>
                  </div>
                </label>

                <div style={{ display: 'flex', gap: '10px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setIsSettingOpen(false)}
                    style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'transparent', border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', fontWeight: 600, cursor: 'pointer' }}
                  >
                    취소
                  </button>
                  <button
                    type="submit"
                    style={{ flex: 1, padding: '12px', borderRadius: '10px', background: 'var(--accent-gold)', border: 'none', color: '#111', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
                  >
                    <Save size={16} /> 저장하여 전송
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
