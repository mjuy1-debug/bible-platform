import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Tv, Play, Settings, X, Save, Radio, Check, Power } from 'lucide-react';
import { UserContext } from '../context/UserContext';
import { db } from '../services/firebase';
import { doc, onSnapshot, setDoc } from 'firebase/firestore';

// 기본 벧엘교회 유튜브 채널 라이브 URL
const DEFAULT_YOUTUBE_LIVE_URL = 'https://www.youtube.com/@bethelchurch/live';

const PRESET_SERVICES = [
  { title: '🔴 주일 대예배 생방송 중', subtitle: '지금 벧엘교회 주일 대예배가 실시간으로 방송되고 있습니다.' },
  { title: '🔴 주일 오후 찬양예배 생방송 중', subtitle: '지금 주일 오후 찬양예배가 실시간으로 방송되고 있습니다.' },
  { title: '🔴 수요 저녁예배 생방송 중', subtitle: '지금 수요 저녁 예배가 실시간으로 방송되고 있습니다.' },
  { title: '🔴 금요 심야기도회 생방송 중', subtitle: '지금 금요 심야 은혜기도회가 실시간으로 방송되고 있습니다.' },
  { title: '🔴 특별 부흥 성회 생방송 중', subtitle: '지금 특별 부흥 성회가 실시간으로 방송되고 있습니다.' },
];

export default function LiveBanner() {
  const { currentUser, showToast } = useContext(UserContext);
  const [isLive, setIsLive] = useState(false);
  const [liveTitle, setLiveTitle] = useState('🔴 실시간 예배 생방송 중');
  const [liveSubtitle, setLiveSubtitle] = useState('지금 실시간 예배가 방송되고 있습니다.');
  const [liveUrl, setLiveUrl] = useState(DEFAULT_YOUTUBE_LIVE_URL);
  
  // 모달 폼 상태
  const [isSettingOpen, setIsSettingOpen] = useState(false);
  const [inputUrl, setInputUrl] = useState(DEFAULT_YOUTUBE_LIVE_URL);
  const [inputTitle, setInputTitle] = useState('🔴 주일 대예배 생방송 중');
  const [inputSubtitle, setInputSubtitle] = useState('지금 벧엘교회 주일 대예배가 실시간으로 방송되고 있습니다.');
  const [inputIsLive, setInputIsLive] = useState(false);

  const isAdmin = Boolean(
    currentUser && (
      currentUser.email?.includes('admin') || 
      currentUser.displayName?.includes('유정파파') ||
      currentUser.displayName?.includes('관리자')
    )
  );

  // Firestore에서 실시간 라이브 설정 동기화 (수동 제어)
  useEffect(() => {
    const unsub = onSnapshot(doc(db, 'settings', 'liveStream'), (snap) => {
      if (snap.exists()) {
        const data = snap.data();
        const active = Boolean(data.isLive || data.forceLive);
        setIsLive(active);
        setInputIsLive(active);

        if (data.url) {
          setLiveUrl(data.url);
          setInputUrl(data.url);
        }
        if (data.title) {
          setLiveTitle(data.title);
          setInputTitle(data.title);
        }
        if (data.subtitle) {
          setLiveSubtitle(data.subtitle);
          setInputSubtitle(data.subtitle);
        }
      } else {
        setIsLive(false);
        setInputIsLive(false);
        setInputUrl(DEFAULT_YOUTUBE_LIVE_URL);
      }
    }, (err) => {
      console.warn('라이브 설정 불러오기:', err);
    });

    return () => unsub();
  }, []);

  // 관리자 빠른 ON/OFF 토글
  const handleQuickToggle = async () => {
    const nextState = !isLive;
    try {
      await setDoc(doc(db, 'settings', 'liveStream'), {
        isLive: nextState,
        forceLive: nextState,
        url: liveUrl,
        title: liveTitle,
        subtitle: liveSubtitle,
        updatedBy: currentUser?.displayName || '관리자',
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setIsLive(nextState);
      setInputIsLive(nextState);
      if (showToast) {
        showToast(nextState ? '🔴 실시간 방송 배너를 켰습니다! (모든 성도에게 표시됨)' : '⏹️ 실시간 방송 배너를 껐습니다.');
      }
    } catch (err) {
      console.error('라이브 토글 오류:', err);
      if (showToast) showToast(`오류: ${err.message}`, 'error');
    }
  };

  // 프리셋 선택
  const handleSelectPreset = (preset) => {
    setInputTitle(preset.title);
    setInputSubtitle(preset.subtitle);
  };

  // 관리자 설정 전체 저장 (Firestore)
  const handleSaveSettings = async (e) => {
    e.preventDefault();
    if (!inputUrl.trim()) return;

    try {
      await setDoc(doc(db, 'settings', 'liveStream'), {
        url: inputUrl.trim(),
        title: inputTitle.trim() || '🔴 실시간 예배 생방송 중',
        subtitle: inputSubtitle.trim() || '지금 실시간 예배가 방송되고 있습니다.',
        isLive: inputIsLive,
        forceLive: inputIsLive,
        updatedBy: currentUser?.displayName || '관리자',
        updatedAt: new Date().toISOString()
      }, { merge: true });

      setLiveUrl(inputUrl.trim());
      setLiveTitle(inputTitle.trim());
      setLiveSubtitle(inputSubtitle.trim());
      setIsLive(inputIsLive);
      setIsSettingOpen(false);
      if (showToast) showToast('✅ 실시간 방송 설정이 저장되었습니다!');
    } catch (err) {
      console.error('라이브 설정 저장 오류:', err);
      if (showToast) showToast(`저장 오류: ${err.message}`, 'error');
    }
  };

  return (
    <>
      {/* 1. 관리자 전용 수동 제어 바 (관리자 로그인 시 항상 노출) */}
      {isAdmin && (
        <div style={{
          maxWidth: '960px',
          margin: '0 auto 1rem',
          padding: '8px 14px',
          borderRadius: '12px',
          background: isLive ? 'rgba(220, 38, 38, 0.12)' : 'rgba(212, 175, 55, 0.08)',
          border: isLive ? '1px solid rgba(239, 68, 68, 0.35)' : '1px solid rgba(212, 175, 55, 0.25)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Radio size={15} color={isLive ? '#ef4444' : 'var(--accent-gold)'} />
            <span style={{ fontSize: '12px', fontWeight: 700, color: isLive ? '#f87171' : 'var(--accent-gold)' }}>
              실시간 방송 관리 (수동 제어):
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '99px',
              background: isLive ? '#dc2626' : 'rgba(255,255,255,0.1)',
              color: isLive ? '#fff' : 'var(--text-secondary)'
            }}>
              {isLive ? '🔴 방송 중 (배너 켜짐)' : '⚫ 방송 종료 (배너 숨김)'}
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {/* 빠른 ON / OFF 토글 버튼 */}
            <button
              onClick={handleQuickToggle}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 12px',
                borderRadius: '8px',
                background: isLive ? '#4b5563' : '#dc2626',
                border: 'none',
                color: '#fff',
                fontSize: '12px',
                fontWeight: 700,
                cursor: 'pointer',
                transition: 'all 0.2s'
              }}
            >
              <Power size={13} />
              {isLive ? '배너 끄기' : '🔴 지금 배너 켜기'}
            </button>

            {/* 상세 설정 버튼 */}
            <button
              onClick={() => setIsSettingOpen(true)}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: '5px 10px',
                borderRadius: '8px',
                background: 'rgba(255,255,255,0.06)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)',
                fontSize: '12px',
                fontWeight: 600,
                cursor: 'pointer'
              }}
              title="예배 제목 및 유튜브 링크 설정"
            >
              <Settings size={13} /> 설정
            </button>
          </div>
        </div>
      )}

      {/* 2. 실시간 예배 배너 (관리자가 수동으로 켰을 때만 모든 성도에게 표시) */}
      <AnimatePresence>
        {isLive && (
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
                    {liveTitle}
                  </h3>
                </div>
                <p style={{ margin: '4px 0 0 0', fontSize: 'clamp(0.78rem, 2vw, 0.84rem)', color: 'rgba(255, 255, 255, 0.85)', lineHeight: 1.4, wordBreak: 'keep-all' }}>
                  {liveSubtitle}
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
                  title="라이브 방송 내용 수정"
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

      {/* 3. 관리자 라이브 링크 & 방송 설정 모달 */}
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
                borderRadius: '20px', padding: '24px', width: '100%', maxWidth: '500px',
                maxHeight: '90vh', overflowY: 'auto'
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h3 style={{ margin: 0, fontSize: '1.15rem', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-gold)' }}>
                  <Tv size={20} /> 실시간 방송 관리 (수동 제어)
                </h3>
                <button onClick={() => setIsSettingOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                  <X size={20} />
                </button>
              </div>

              <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {/* 1. 수동 라이브 켜기 / 끄기 토글 */}
                <label style={{
                  display: 'flex', alignItems: 'center', gap: '12px', padding: '14px',
                  borderRadius: '12px', background: inputIsLive ? 'rgba(220,38,38,0.15)' : 'rgba(255,255,255,0.03)',
                  border: inputIsLive ? '1px solid rgba(220,38,38,0.5)' : '1px solid var(--glass-border)',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={inputIsLive}
                    onChange={(e) => setInputIsLive(e.target.checked)}
                    style={{ width: '18px', height: '18px', accentColor: '#dc2626' }}
                  />
                  <div>
                    <p style={{ margin: 0, fontSize: '14px', fontWeight: 800, color: inputIsLive ? '#f87171' : 'var(--text-primary)' }}>
                      {inputIsLive ? '🔴 실시간 방송 배너 켜기 (ON)' : '⚫ 실시간 방송 배너 끄기 (OFF)'}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: '12px', color: 'var(--text-secondary)' }}>
                      체크하면 홈 화면에 즉시 생방송 배너가 노출됩니다.
                    </p>
                  </div>
                </label>

                {/* 2. 빠른 예배 프리셋 선택 */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '8px', color: 'var(--text-primary)' }}>
                    빠른 예배 제목 선택
                  </label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                    {PRESET_SERVICES.map((p, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => handleSelectPreset(p)}
                        style={{
                          padding: '5px 10px',
                          borderRadius: '8px',
                          background: inputTitle === p.title ? 'rgba(212,175,55,0.2)' : 'rgba(255,255,255,0.04)',
                          border: inputTitle === p.title ? '1px solid var(--accent-gold)' : '1px solid var(--glass-border)',
                          color: inputTitle === p.title ? 'var(--accent-gold)' : 'var(--text-secondary)',
                          fontSize: '11px',
                          fontWeight: 600,
                          cursor: 'pointer'
                        }}
                      >
                        {p.title.replace('🔴 ', '')}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 3. 배너 제목 직접 수정 */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                    배너 타이틀
                  </label>
                  <input
                    type="text"
                    required
                    value={inputTitle}
                    onChange={(e) => setInputTitle(e.target.value)}
                    placeholder="예: 🔴 주일 대예배 생방송 중"
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '8px',
                      background: 'var(--bg-primary)', border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)', fontSize: '13px', boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* 4. 배너 설명 */}
                <div>
                  <label style={{ display: 'block', fontSize: '13px', fontWeight: 700, marginBottom: '6px', color: 'var(--text-primary)' }}>
                    배너 안내 문구
                  </label>
                  <input
                    type="text"
                    required
                    value={inputSubtitle}
                    onChange={(e) => setInputSubtitle(e.target.value)}
                    placeholder="예: 지금 벧엘교회 주일 대예배가 실시간으로 방송되고 있습니다."
                    style={{
                      width: '100%', padding: '10px 12px', borderRadius: '8px',
                      background: 'var(--bg-primary)', border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)', fontSize: '13px', boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* 5. 유튜브 라이브 URL */}
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
                      width: '100%', padding: '10px 12px', borderRadius: '8px',
                      background: 'var(--bg-primary)', border: '1px solid var(--glass-border)',
                      color: 'var(--text-primary)', fontSize: '13px', boxSizing: 'border-box'
                    }}
                  />
                  <p style={{ margin: '4px 0 0', fontSize: '11px', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    💡 채널 주소 뒤에 <code>/live</code>를 붙여두시면 생방송 시 항상 해당 영상으로 자동 연결됩니다.
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
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
                    <Save size={16} /> 설정 저장하기
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
