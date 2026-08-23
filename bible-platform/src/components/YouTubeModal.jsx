import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, ExternalLink, BookOpen, Sparkles, Tv, CheckCircle2 } from 'lucide-react';

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
    title = '바이블프로젝트 말씀 영상',
    characterName = '',
    searchKeyword = '',
    description = '성경 인물과 말씀의 핵심을 시각적으로 깊이 있게 이해할 수 있는 고품질 애니메이션 영상입니다.',
    duration = '약 5~8분',
    channel = '바이블프로젝트 (BibleProject - Korean)'
  } = videoInfo;

  // 100% 정상 작동하는 공식 유튜브 검색 & 재생 링크
  const query = searchKeyword || (characterName ? `바이블프로젝트 ${characterName}` : title);
  const youtubeSearchUrl = `https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`;
  const bpOfficialUrl = 'https://bibleproject.com/korean/';

  const handleOpenYouTube = () => {
    window.open(youtubeSearchUrl, '_blank', 'noopener,noreferrer');
  };

  const handleOpenBpSite = () => {
    window.open(bpOfficialUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.88)',
        backdropFilter: 'blur(10px)',
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
          boxShadow: '0 24px 60px rgba(0, 0, 0, 0.7), 0 0 35px rgba(212, 175, 55, 0.2)',
          borderRadius: '24px',
          width: '100%',
          maxWidth: '560px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '92vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 헤더 */}
        <div style={{
          padding: '18px 22px',
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
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 14px rgba(255, 0, 0, 0.4)'
            }}>
              <YouTubeIcon size={20} color="#fff" />
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
                {characterName ? `👑 ${characterName} 말씀 영상` : title}
              </h3>
              <span style={{ fontSize: '0.76rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
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
              width: '34px',
              height: '34px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 영상 프리뷰 & 대형 재생 배너 영역 */}
        <div style={{
          padding: '24px 22px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
          gap: '16px',
          background: 'linear-gradient(180deg, rgba(239, 68, 68, 0.06) 0%, rgba(20, 20, 26, 0.98) 100%)'
        }}>
          {/* 유튜브 플레이 버튼 카드 */}
          <div
            onClick={handleOpenYouTube}
            style={{
              width: '100%',
              padding: '24px 16px',
              borderRadius: '18px',
              background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.15) 0%, rgba(20, 20, 28, 0.9) 100%)',
              border: '1px solid rgba(255, 0, 0, 0.35)',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '14px',
              cursor: 'pointer',
              boxShadow: '0 8px 30px rgba(0, 0, 0, 0.4)',
              transition: 'transform 0.15s, border-color 0.15s'
            }}
          >
            <div style={{
              width: '68px',
              height: '68px',
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #ff0000 0%, #b30000 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 8px 24px rgba(255, 0, 0, 0.5)'
            }}>
              <Play size={30} color="#fff" fill="#fff" style={{ marginLeft: '4px' }} />
            </div>

            <div>
              <h4 style={{
                margin: '0 0 6px 0',
                fontSize: '1.08rem',
                fontWeight: 800,
                color: '#fff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}>
                ▶️ YouTube에서 영상 시청하기
              </h4>
              <p style={{ margin: 0, fontSize: '0.82rem', color: 'rgba(255, 255, 255, 0.75)', lineHeight: 1.45 }}>
                바이블프로젝트 공식 채널의 "{query}" 영상을 시청합니다
              </p>
            </div>
          </div>

          {/* 영상 설명 & 핵심 묵상 */}
          <div style={{
            width: '100%',
            padding: '14px 16px',
            borderRadius: '14px',
            background: 'rgba(212, 175, 55, 0.08)',
            border: '1px solid rgba(212, 175, 55, 0.25)',
            textAlign: 'left'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--accent-gold)', fontWeight: 800, fontSize: '0.86rem', marginBottom: '6px' }}>
              <Sparkles size={15} /> 묵상 가이드
            </div>
            <p style={{
              margin: 0,
              fontSize: '0.84rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.55,
              wordBreak: 'keep-all'
            }}>
              {description}
            </p>
          </div>
        </div>

        {/* 모달 푸터 / 액션 버튼 */}
        <div style={{
          padding: '16px 22px',
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          background: 'rgba(15, 15, 20, 0.98)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          {/* 공식 웹사이트 */}
          <button
            onClick={handleOpenBpSite}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '9px 14px',
              borderRadius: '10px',
              background: 'rgba(255, 255, 255, 0.06)',
              border: '1px solid var(--glass-border)',
              color: 'var(--text-secondary)',
              fontSize: '0.8rem',
              fontWeight: 600,
              cursor: 'pointer'
            }}
          >
            <ExternalLink size={13} /> 바이블프로젝트 공식 홈
          </button>

          {/* 닫기 & 퀴즈 풀기 */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={onClose}
              style={{
                padding: '9px 15px',
                borderRadius: '10px',
                background: 'rgba(255, 255, 255, 0.08)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)',
                fontSize: '0.84rem',
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
                  padding: '9px 18px',
                  borderRadius: '10px',
                  background: 'var(--accent-gold)',
                  border: 'none',
                  color: '#111',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  boxShadow: '0 4px 14px rgba(212, 175, 55, 0.35)'
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
