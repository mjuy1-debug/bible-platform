import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Minus, ChevronUp, PlayCircle } from 'lucide-react';

/**
 * 화면 우측 하단에 고정되는 유튜브 임베드 플레이어
 * videoId가 있으면 직접 재생, 없으면 검색 링크 안내
 */
const BiblePlayer = ({ embedUrl, title, onClose }) => {
  const [minimized, setMinimized] = useState(false);

  if (!embedUrl) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 80, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 80, scale: 0.95 }}
        transition={{ type: 'spring', stiffness: 300, damping: 28 }}
        className="bible-player-float"
        style={{
          position: 'fixed',
          bottom: '1.5rem',
          right: '1.5rem',
          zIndex: 9000,
          width: minimized ? '300px' : '340px',
          borderRadius: '16px',
          overflow: 'hidden',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
          border: '1px solid var(--glass-border)',
          background: 'var(--bg-secondary)',
        }}
      >
        {/* Header Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '0.7rem 1rem',
          background: '#0f0f0f',
          gap: '0.5rem',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flex: 1, minWidth: 0 }}>
            <PlayCircle size={16} color="#FF0000" />
            <span style={{
              color: '#fff', fontSize: '0.82rem', fontWeight: 600,
              overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
            }}>
              {title}
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.4rem', flexShrink: 0 }}>
            <button
              onClick={() => setMinimized(m => !m)}
              style={{ color: '#aaa', display: 'flex', padding: '0.2rem', cursor: 'pointer' }}
              title={minimized ? '펼치기' : '최소화'}
            >
              {minimized ? <ChevronUp size={16} /> : <Minus size={16} />}
            </button>
            <button
              onClick={onClose}
              style={{ color: '#aaa', display: 'flex', padding: '0.2rem', cursor: 'pointer' }}
              title="닫기"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* YouTube IFrame */}
        {!minimized && (
          <iframe
            key={embedUrl}
            src={embedUrl}
            title={title}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            style={{
              width: '100%',
              height: '195px',
              border: 'none',
              display: 'block',
            }}
          />
        )}

        {/* Minimized state — 제목 + 재생 중 표시 */}
        {minimized && (
          <div style={{ padding: '0.7rem 1rem', display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
            <div style={{
              display: 'flex', gap: '3px', alignItems: 'flex-end',
            }}>
              {[1, 2, 3].map(i => (
                <div key={i} style={{
                  width: '3px', background: '#FF0000', borderRadius: '2px',
                  animation: `eq-bar-${i} 0.8s ease-in-out infinite alternate`,
                  height: `${6 + i * 4}px`,
                  animationDelay: `${i * 0.15}s`,
                }} />
              ))}
            </div>
            <span style={{ color: 'var(--text-secondary)', fontSize: '0.82rem' }}>재생 중...</span>
          </div>
        )}
      </motion.div>

      <style>{`
        @keyframes eq-bar-1 { from { height: 6px } to { height: 18px } }
        @keyframes eq-bar-2 { from { height: 10px } to { height: 6px } }
        @keyframes eq-bar-3 { from { height: 8px } to { height: 20px } }
      `}</style>
    </AnimatePresence>
  );
};

export default BiblePlayer;
