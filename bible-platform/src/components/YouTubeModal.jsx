import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, ExternalLink, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

function YouTubeIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

export default function YouTubeModal({ isOpen, onClose, videoInfo, onStartQuiz }) {
  const [iframeError, setIframeError] = useState(false);

  if (!isOpen || !videoInfo) return null;

  const {
    title = '바이블프로젝트 말씀 영상',
    characterName = '',
    videoId = 'kYJv4032m-U',
    youtubeUrl = `https://www.youtube.com/watch?v=${videoId}`,
    bibleProjectUrl = 'https://bibleproject.com/korean/',
    description = '성경 인물과 말씀의 핵심을 시각적으로 깊이 있게 이해할 수 있는 고품질 애니메이션 영상입니다.',
    duration = '약 7~9분',
    channel = '바이블프로젝트 (BibleProject - Korean)'
  } = videoInfo;

  // YouTube 안전 임베드 URL 구성 (nocookie + origin + rel=0)
  const currentOrigin = typeof window !== 'undefined' ? window.location.origin : '';
  const embedUrl = `https://www.youtube-nocookie.com/embed/${videoId}?enablejsapi=1&origin=${encodeURIComponent(currentOrigin)}&rel=0&modestbranding=1`;

  const handleOpenDirectYouTube = () => {
    window.open(youtubeUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenBpSite = () => {
    window.open(bibleProjectUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.90)',
        backdropFilter: 'blur(12px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.94, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.94, y: 20 }}
        transition={{ duration: 0.22, ease: 'easeOut' }}
        style={{
          background: 'linear-gradient(145deg, #1c1c24 0%, #121218 100%)',
          border: '1px solid rgba(212, 175, 55, 0.4)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.8), 0 0 35px rgba(212, 175, 55, 0.2)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '640px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '94vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 헤더 */}
        <div style={{
          padding: '16px 20px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.03)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(255, 0, 0, 0.35)'
            }}>
              <YouTubeIcon size={20} color="#fff" />
            </div>
            <div>
              <h3 style={{
                margin: 0,
                fontSize: '1.02rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {characterName ? `👑 ${characterName} 말씀 영상` : title}
              </h3>
              <span style={{ fontSize: '0.75rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                {channel} • {duration}
              </span>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              background: 'rgba(255, 255, 255, 0.08)',
              border: 'none',
              color: 'var(--text-secondary)',
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 인앱 영상 재생 영역 (16:9 비디오 플레이어) */}
        <div style={{
          position: 'relative',
          width: '100%',
          paddingBottom: '56.25%', // 16:9 Aspect Ratio
          backgroundColor: '#000',
          overflow: 'hidden'
        }}>
          <iframe
            src={embedUrl}
            title={title}
            style={{
              position: 'absolute',
              top: 0,
              left: 0,
              width: '100%',
              height: '100%',
              border: 'none'
            }}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            referrerPolicy="strict-origin-when-cross-origin"
          />
        </div>

        {/* 안내 & 바로가기 영역 */}
        <div style={{
          padding: '16px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          background: 'rgba(20, 20, 26, 0.98)',
          overflowY: 'auto'
        }}>
          {/* 인앱 재생 오류 대비 안내 및 1:1 유튜브 단독 영상 버튼 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: '12px',
            background: 'rgba(255, 0, 0, 0.1)',
            border: '1px solid rgba(255, 0, 0, 0.25)',
            gap: '10px',
            flexWrap: 'wrap'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#ff8080' }}>
              <AlertCircle size={16} />
              <span>화면에서 재생이 안 될 경우 직접 시청하세요</span>
            </div>
            <button
              onClick={handleOpenDirectYouTube}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '8px',
                background: '#ff0000',
                border: 'none',
                color: '#fff',
                fontSize: '0.8rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(255, 0, 0, 0.35)'
              }}
            >
              <ExternalLink size={13} /> YouTube에서 직접 시청 (해당 영상)
            </button>
          </div>

          {/* 영상 설명 & 묵상 가이드 */}
          <div style={{
            padding: '12px 14px',
            borderRadius: '12px',
            background: 'rgba(212, 175, 55, 0.08)',
            border: '1px solid rgba(212, 175, 55, 0.2)'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-gold)', fontWeight: 800, fontSize: '0.82rem', marginBottom: '4px' }}>
              <Sparkles size={14} /> 묵상 가이드
            </div>
            <p style={{
              margin: 0,
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.5,
              wordBreak: 'keep-all'
            }}>
              {description}
            </p>
          </div>
        </div>

        {/* 모달 푸터 / 액션 버튼 */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(15, 15, 20, 0.98)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          {/* 바이블프로젝트 공식 홈페이지 버튼 */}
          <button
            onClick={handleOpenBpSite}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 12px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <ExternalLink size={12} /> 바이블프로젝트 공식 페이지
          </button>

          {/* 닫기 & 퀴즈 풀기 버튼 */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)',
                fontSize: '0.82rem',
                fontWeight: 600,
                cursor: 'pointer'
              }}
            >
              닫기
            </button>
            {onStartQuiz && (
              <button
                onClick={() => {
                  onClose();
                  onStartQuiz();
                }}
                style={{
                  padding: '8px 16px',
                  borderRadius: '8px',
                  background: 'var(--accent-gold)',
                  border: 'none',
                  color: '#111',
                  fontSize: '0.82rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 4px 12px rgba(212, 175, 55, 0.3)'
                }}
              >
                ✏️ 바로 퀴즈 풀기
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
