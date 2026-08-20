import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Radio, ExternalLink, Play, Tv } from 'lucide-react';

// 벧엘교회 공식 유튜브 라이브 스트리밍 채널/영상 링크
const DEFAULT_YOUTUBE_LIVE_URL = 'https://www.youtube.com/@bethelchurch/live';

export default function LiveBanner() {
  const [isLiveTime, setIsLiveTime] = useState(false);
  const [liveInfo, setLiveInfo] = useState({ title: '', subtitle: '' });

  useEffect(() => {
    const checkLiveSchedule = () => {
      const now = new Date();
      // 한국 시간 (KST) 기준 요일 및 시간
      const day = now.getDay(); // 0: 일, 1: 월, 2: 화, 3: 수, 4: 목, 5: 금, 6: 토
      const hour = now.getHours();
      const minute = now.getMinutes();
      const timeVal = hour * 60 + minute; // 0 ~ 1439 분

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
      // 3. 수요 성경강해 / 예배 (수요일 19:00 ~ 21:30)
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

      // 관리자 수동 테스트 또는 강제 라이브 플래그 확인
      const manualLive = localStorage.getItem('manual_live_override') === 'true';
      if (manualLive) {
        live = true;
        title = title || '🔴 특별 예배 생방송 중';
        subtitle = subtitle || '지금 벧엘교회 실시간 예배가 방송되고 있습니다.';
      }

      setIsLiveTime(live);
      setLiveInfo({ title, subtitle });
    };

    checkLiveSchedule();
    const interval = setInterval(checkLiveSchedule, 60000); // 매 1분마다 자동 확인
    return () => clearInterval(interval);
  }, []);

  if (!isLiveTime) return null;

  return (
    <AnimatePresence>
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
          {/* 붉은 펄스 라이브 아이콘 */}
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
              animation: 'pulse 1.5s infinite'
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

        <a
          href={DEFAULT_YOUTUBE_LIVE_URL}
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
            flexShrink: 0,
          }}
          onMouseOver={(e) => e.currentTarget.style.background = '#b91c1c'}
          onMouseOut={(e) => e.currentTarget.style.background = '#dc2626'}
        >
          <Play size={15} fill="#fff" /> 실시간 예배 참여하기
        </a>
      </motion.div>
    </AnimatePresence>
  );
}
