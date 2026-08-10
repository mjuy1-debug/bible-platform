import React, { useContext, useState, createContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

// Dummy context to allow the component to render without errors if UserContext is not provided elsewhere
export const UserContext = createContext({
  state: {
    streak: { current: 0, longest: 0, lastCompletedDate: null }
  }
});

export default function StreakBadge() {
  // Gracefully fallback if the real context doesn't match this shape yet
  const context = useContext(UserContext);
  const streak = context?.state?.streak || { current: 0, longest: 0 };
  const { current, longest } = streak;

  const [isOpen, setIsOpen] = useState(false);

  // Determine styles based on streak level
  let badgeStyle = {
    background: 'rgba(255, 255, 255, 0.1)',
    boxShadow: 'none',
    border: '1px solid rgba(255,255,255,0.2)'
  };
  let animationProps = {};

  if (current >= 30) {
    badgeStyle = {
      background: 'linear-gradient(45deg, #ff0000, #ff7f00, #ffff00, #00ff00, #0000ff, #4b0082, #8b00ff)',
      backgroundSize: '400% 400%',
      color: 'white',
      border: 'none',
      fontWeight: 'bold',
      boxShadow: '0 0 15px rgba(255,255,255,0.5)'
    };
    animationProps = {
      animate: { backgroundPosition: ['0% 50%', '100% 50%', '0% 50%'] },
      transition: { duration: 3, repeat: Infinity, ease: 'linear' }
    };
  } else if (current >= 7) {
    badgeStyle = {
      background: 'linear-gradient(135deg, #FF6B6B, #FF8E53)',
      color: 'white',
      border: 'none',
      fontWeight: 'bold',
      boxShadow: '0 0 10px rgba(255, 107, 107, 0.6)'
    };
    animationProps = {
      animate: { scale: [1, 1.05, 1] },
      transition: { duration: 2, repeat: Infinity }
    };
  } else if (current >= 3) {
    badgeStyle = {
      background: 'rgba(255, 215, 0, 0.15)',
      color: '#ffd700',
      border: '1px solid rgba(255,215,0,0.5)',
      boxShadow: '0 0 8px rgba(255, 215, 0, 0.3)'
    };
  }

  const togglePopup = () => setIsOpen(!isOpen);

  return (
    <div style={{ position: 'relative', display: 'inline-block', fontFamily: 'sans-serif' }}>
      <motion.div
        {...animationProps}
        onClick={togglePopup}
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '0.4rem',
          padding: '0.4rem 0.8rem',
          borderRadius: '20px',
          cursor: 'pointer',
          fontSize: '0.9rem',
          ...badgeStyle
        }}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <span>🔥</span>
        <span>{current > 0 ? `${current}일 연속` : '통독 시작하기'}</span>
      </motion.div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 10px)',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#1e1e1e',
              border: '1px solid #333',
              borderRadius: '12px',
              padding: '1rem',
              width: '200px',
              zIndex: 100,
              boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
              color: 'white'
            }}
          >
            <h4 style={{ margin: '0 0 1rem 0', fontSize: '1rem', textAlign: 'center', borderBottom: '1px solid #333', paddingBottom: '0.5rem' }}>
              내 연속 통독
            </h4>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', fontSize: '0.9rem' }}>
              <span style={{ color: '#aaa' }}>현재 연속:</span>
              <span style={{ fontWeight: 'bold', color: '#FF8E53' }}>{current}일 🔥</span>
            </div>
            
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', fontSize: '0.9rem' }}>
              <span style={{ color: '#aaa' }}>최장 연속:</span>
              <span style={{ fontWeight: 'bold' }}>{longest}일 👑</span>
            </div>

            <div>
              <div style={{ fontSize: '0.8rem', color: '#aaa', marginBottom: '0.5rem' }}>나의 배지</div>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', fontSize: '1.2rem' }}>
                {longest >= 3 ? <span title="3일 연속">🥉</span> : <span style={{opacity: 0.2}}>🥉</span>}
                {longest >= 7 ? <span title="7일 연속">🥈</span> : <span style={{opacity: 0.2}}>🥈</span>}
                {longest >= 30 ? <span title="30일 연속">🥇</span> : <span style={{opacity: 0.2}}>🥇</span>}
                {longest >= 100 ? <span title="100일 연속">👑</span> : <span style={{opacity: 0.2}}>👑</span>}
              </div>
            </div>
            
            <button 
              onClick={togglePopup}
              style={{
                width: '100%',
                padding: '0.4rem',
                marginTop: '1rem',
                background: '#333',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                cursor: 'pointer'
              }}
            >
              닫기
            </button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
