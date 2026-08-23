// src/components/YouTubeModal.jsx
import React from 'react';
import { motion } from 'framer-motion';
import { X, Play, ExternalLink, Sparkles, BookOpen, CheckCircle2 } from 'lucide-react';

function YouTubeIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

export default function YouTubeModal({ isOpen, onClose, videoInfo, onStartQuiz }) {
  if (!isOpen || !videoInfo) return null;

  const {
    title = '성경 말씀 & 스토리 가이드',
    characterName = '',
    relationReason = '',
    channelTitle = '바이블프로젝트 & 성경 말씀 스토리',
    description = '',
    duration = '약 7~10분',
    officialHome = 'https://bibleproject.com/korean/',
    searchUrl = 'https://www.youtube.com/@BibleProjectKorean'
  } = videoInfo;

  const handleOpenYouTube = () => {
    window.open(searchUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenBpHome = () => {
    window.open(officialHome, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.92)',
        backdropFilter: 'blur(14px)',
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
          background: 'linear-gradient(145deg, #1d1d26 0%, #121218 100%)',
          border: '1px solid rgba(212, 175, 55, 0.45)',
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.85), 0 0 40px rgba(212, 175, 55, 0.25)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '620px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh'
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
              width: '38px',
              height: '38px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 14px rgba(255, 0, 0, 0.4)'
            }}>
              <YouTubeIcon size={22} color="#fff" />
            </div>
            <div>
              <h3 style={{
                margin: 0,
                fontSize: '1.05rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {title}
              </h3>
              <span style={{ fontSize: '0.78rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                {channelTitle} • {duration}
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
              cursor: 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 메인 비디오 액션 배너 */}
        <div style={{
          padding: '20px',
          background: 'radial-gradient(ellipse at top, rgba(212, 175, 55, 0.15) 0%, rgba(15, 15, 20, 0.8) 100%)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '14px'
        }}>
          <div style={{
            fontSize: '0.9rem',
            fontWeight: 800,
            color: 'var(--accent-gold)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <BookOpen size={18} />
            {relationReason}
          </div>

          {/* 대형 유튜브 직접 재생 버튼 */}
          <button
            onClick={handleOpenYouTube}
            style={{
              width: '100%',
              maxWidth: '460px',
              padding: '14px 20px',
              borderRadius: '16px',
              background: 'linear-gradient(135deg, #ff0000 0%, #b30000 100%)',
              border: '1px solid rgba(255, 255, 255, 0.25)',
              color: '#fff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '12px',
              boxShadow: '0 8px 24px rgba(255, 0, 0, 0.45)',
              transition: 'transform 0.15s, box-shadow 0.15s'
            }}
            onMouseOver={(e) => (e.currentTarget.style.transform = 'translateY(-2px)')}
            onMouseOut={(e) => (e.currentTarget.style.transform = 'translateY(0)')}
          >
            <div style={{
              width: '32px',
              height: '32px',
              borderRadius: '50%',
              background: 'rgba(255, 255, 255, 0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <Play size={18} fill="#fff" style={{ marginLeft: '2px' }} />
            </div>
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontSize: '0.96rem', fontWeight: 900 }}>
                ▶️ YouTube에서 직결 말씀 영상 시청하기
              </div>
              <div style={{ fontSize: '0.74rem', color: 'rgba(255, 255, 255, 0.85)' }}>
                {characterName ? `"${characterName}" 관련 핵심 영상 보기` : '관련 성경 강해 & 애니메이션 영상 보기'}
              </div>
            </div>
            <ExternalLink size={18} style={{ marginLeft: 'auto', opacity: 0.9 }} />
          </button>
        </div>

        {/* 본문 영역: 퀴즈 100점 대비 족보 & 핵심 묵상 포인트 */}
        <div style={{
          padding: '18px 20px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          background: 'rgba(18, 18, 24, 0.98)',
          overflowY: 'auto',
          flex: 1
        }}>
          <div style={{
            padding: '16px',
            borderRadius: '16px',
            background: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              color: 'var(--accent-gold)',
              fontWeight: 800,
              fontSize: '0.88rem'
            }}>
              <Sparkles size={16} /> 퀴즈 만점 족보 & 핵심 묵상 가이드
            </div>

            <p style={{
              margin: 0,
              fontSize: '0.84rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
              wordBreak: 'keep-all',
              whiteSpace: 'pre-line'
            }}>
              {description}
            </p>
          </div>
        </div>

        {/* 모달 푸터 */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(12, 12, 16, 0.98)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <button
            onClick={handleOpenBpHome}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '8px 14px',
              borderRadius: '8px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-secondary)',
              fontSize: '0.78rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <ExternalLink size={12} /> 바이블프로젝트 공식 홈
          </button>

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
                  fontSize: '0.84rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 14px rgba(212, 175, 55, 0.35)'
                }}
              >
                <CheckCircle2 size={16} /> ✏️ 바로 퀴즈 풀기
              </button>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
