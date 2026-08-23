import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Play, ExternalLink, BookOpen, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

function YouTubeIcon({ size = 20, color = 'currentColor' }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={color}>
      <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
    </svg>
  );
}

export default function YouTubeModal({ isOpen, onClose, videoInfo, onStartQuiz }) {
  const [embedError, setEmbedError] = useState(false);

  if (!isOpen || !videoInfo) return null;

  const {
    title = '바이블프로젝트 말씀 영상',
    characterName = '',
    videoId = null,
    searchQuery = '',
    description = '성경 인물과 말씀의 핵심을 시각적으로 깊이 있게 이해할 수 있는 고품질 애니메이션 영상입니다.',
    duration = '약 5~8분',
    channel = '바이블프로젝트 (BibleProject)'
  } = videoInfo;

  // 유튜브 URL
  const youtubeUrl = videoId
    ? `https://www.youtube.com/watch?v=${videoId}`
    : `https://www.youtube.com/results?search_query=${encodeURIComponent(searchQuery || `바이블프로젝트 ${characterName || title}`)}`;

  // 임베드 URL (videoId가 있으면 직접 임베드, origin 지정)
  const originParam = typeof window !== 'undefined' ? encodeURIComponent(window.location.origin) : '';
  const embedUrl = videoId
    ? `https://www.youtube.com/embed/${videoId}?autoplay=1&rel=0&enablejsapi=1&origin=${originParam}`
    : null;

  // 썸네일 URL
  const thumbnailUrl = videoId 
    ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`
    : null;

  const handleOpenYouTube = () => {
    window.open(youtubeUrl, '_blank', 'noopener,noreferrer');
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
        backdropFilter: 'blur(8px)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ duration: 0.25, ease: 'easeOut' }}
        style={{
          background: 'linear-gradient(145deg, #18181f 0%, #121217 100%)',
          border: '1px solid rgba(212, 175, 55, 0.35)',
          boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(212, 175, 55, 0.15)',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '680px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '90vh'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* 모달 헤더 */}
        <div style={{
          padding: '14px 18px',
          borderBottom: '1px solid rgba(255, 255, 255, 0.08)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'rgba(255, 255, 255, 0.02)'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '10px',
              background: 'linear-gradient(135deg, #ff0000 0%, #cc0000 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#fff',
              boxShadow: '0 4px 12px rgba(255, 0, 0, 0.3)'
            }}>
              <YouTubeIcon size={18} color="#fff" />
            </div>
            <div>
              <h3 style={{
                margin: 0,
                fontSize: '0.98rem',
                fontWeight: 800,
                color: 'var(--text-primary)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                {characterName ? `👑 ${characterName} • ` : ''}{title}
              </h3>
              <span style={{ fontSize: '0.74rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
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
              cursor: 'pointer',
              transition: 'all 0.15s'
            }}
          >
            <X size={18} />
          </button>
        </div>

        {/* 비디오 플레이어 영역 (16:9 비율) */}
        <div style={{
          position: 'relative',
          width: '100%',
          paddingTop: '56.25%',
          backgroundColor: '#050508'
        }}>
          {embedUrl && !embedError ? (
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
              onError={() => setEmbedError(true)}
            />
          ) : (
            /* 임베드 불가 또는 검색 기반일 때의 예쁜 썸네일 & 원클릭 유튜브 실행 카드 */
            <div
              onClick={handleOpenYouTube}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                backgroundImage: thumbnailUrl ? `linear-gradient(rgba(0,0,0,0.4), rgba(0,0,0,0.85)), url(${thumbnailUrl})` : 'linear-gradient(135deg, #1c1c24 0%, #0d0d12 100%)',
                backgroundSize: 'cover',
                backgroundPosition: 'center',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '12px',
                cursor: 'pointer',
                padding: '20px',
                textAlign: 'center'
              }}
            >
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: '#ff0000',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 8px 24px rgba(255, 0, 0, 0.5)',
                transition: 'transform 0.2s',
                cursor: 'pointer'
              }}>
                <Play size={28} color="#fff" fill="#fff" style={{ marginLeft: '4px' }} />
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', fontSize: '1rem', fontWeight: 800, color: '#fff' }}>
                  YouTube에서 바로 시청하기
                </h4>
                <p style={{ margin: 0, fontSize: '0.78rem', color: 'rgba(255,255,255,0.8)' }}>
                  클릭하시면 바이블프로젝트 공식 영상으로 바로 이동합니다
                </p>
              </div>
            </div>
          )}
        </div>

        {/* 하단 설명 및 액션 버튼 */}
        <div style={{
          padding: '16px 18px',
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
          background: 'rgba(18, 18, 24, 0.98)'
        }}>
          {/* 설명 문구 */}
          <div style={{
            display: 'flex',
            alignItems: 'flex-start',
            gap: '8px',
            padding: '10px 12px',
            borderRadius: '12px',
            background: 'rgba(212, 175, 55, 0.08)',
            border: '1px solid rgba(212, 175, 55, 0.2)'
          }}>
            <Sparkles size={16} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '2px' }} />
            <p style={{
              margin: 0,
              fontSize: '0.8rem',
              color: 'var(--text-secondary)',
              lineHeight: 1.45,
              wordBreak: 'keep-all'
            }}>
              {description}
            </p>
          </div>

          {/* 안내 배너 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '8px',
            fontSize: '0.74rem',
            color: 'rgba(255, 255, 255, 0.6)'
          }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              💡 영상이 재생되지 않으면 아래 버튼을 눌러 YouTube 앱에서 시청하세요.
            </span>
          </div>

          {/* 액션 버튼 그룹 */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '10px'
          }}>
            {/* 유튜브 앱에서 직접 열기 */}
            <button
              onClick={handleOpenYouTube}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '9px 14px',
                borderRadius: '10px',
                background: 'linear-gradient(135deg, #cc0000 0%, #990000 100%)',
                border: 'none',
                color: '#fff',
                fontSize: '0.82rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(204, 0, 0, 0.3)',
                transition: 'all 0.15s'
              }}
            >
              <YouTubeIcon size={14} color="#fff" /> YouTube 앱에서 바로 보기
            </button>

            {/* 퀴즈 풀기 버튼 & 닫기 */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={onClose}
                style={{
                  padding: '9px 14px',
                  borderRadius: '10px',
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
                    padding: '9px 16px',
                    borderRadius: '10px',
                    background: 'var(--accent-gold)',
                    border: 'none',
                    color: '#111',
                    fontSize: '0.84rem',
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
        </div>
      </motion.div>
    </div>
  );
}
