import React, { useState, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import html2canvas from 'html2canvas';

const THEMES = [
  { id: 'dark-gold', name: 'Dark Gold', style: { background: 'linear-gradient(135deg, #1a1400, #3d2b00)', color: '#ffd700' } },
  { id: 'dawn-sky', name: 'Dawn Sky', style: { background: 'linear-gradient(135deg, #0f0c29, #302b63, #24243e)', color: '#e6e6fa' } },
  { id: 'forest', name: 'Forest', style: { background: 'linear-gradient(135deg, #134e5e, #71b280)', color: '#ffffff' } },
  { id: 'rose', name: 'Rose', style: { background: 'linear-gradient(135deg, #4a0010, #8b0029)', color: '#ffe4e1' } },
  { id: 'minimal-light', name: 'Minimal Light', style: { background: '#f9f6f0', color: '#333333' } },
  { id: 'ocean', name: 'Ocean', style: { background: 'linear-gradient(135deg, #005c97, #363795)', color: '#ffffff' } },
];

const FONT_SIZES = { small: '1rem', medium: '1.25rem', large: '1.5rem' };

export default function VerseCard() {
  const location = useLocation();
  const navigate = useNavigate();
  const cardRef = useRef(null);
  
  const { verses = [], refText = '말씀' } = location.state || {};
  
  const [theme, setTheme] = useState(THEMES[0]);
  const [fontSize, setFontSize] = useState('medium');
  const [align, setAlign] = useState('center');

  const handleDownload = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, {
        scale: 2, // High resolution
        useCORS: true,
        backgroundColor: null
      });
      const dataUrl = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `말씀카드_${refText.replace(/\s+/g, '_')}.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to generate image', err);
      alert('이미지 저장에 실패했습니다.');
    }
  };

  const handleShare = async () => {
    if (!cardRef.current) return;
    try {
      const canvas = await html2canvas(cardRef.current, { scale: 2 });
      canvas.toBlob(async (blob) => {
        if (!blob) return;
        const file = new File([blob], 'verse-card.png', { type: 'image/png' });
        if (navigator.canShare && navigator.canShare({ files: [file] })) {
          await navigator.share({
            title: '오늘의 말씀',
            text: refText,
            files: [file],
          });
        } else {
          alert('공유하기를 지원하지 않는 기기입니다. 이미지 저장 기능을 이용해주세요.');
        }
      });
    } catch (err) {
      console.error('Share failed', err);
    }
  };

  if (!verses.length) {
    return (
      <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-primary)' }}>
        <p>선택된 말씀이 없습니다.</p>
        <button onClick={() => navigate(-1)} style={{ padding: '0.5rem 1rem', marginTop: '1rem', background: 'var(--accent-gold)', border: 'none', borderRadius: '4px', cursor: 'pointer' }}>돌아가기</button>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', background: 'var(--bg-primary, #121212)', padding: '2rem 1rem', color: 'var(--text-primary, #fff)', fontFamily: 'sans-serif' }}>
      
      {/* Card Preview */}
      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        style={{
          width: '100%',
          maxWidth: '375px',
          aspectRatio: '3 / 4',
          height: 'auto',
          minHeight: '400px',
          ...theme.style,
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: align,
          padding: '2rem',
          borderRadius: '16px',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          textAlign: align,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <div style={{ fontSize: '2rem', marginBottom: '1rem', opacity: 0.8 }}>✝️</div>
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', gap: '0.5rem', width: '100%' }}>
          {verses.map((v, i) => (
            <p key={i} style={{ 
              fontSize: FONT_SIZES[fontSize], 
              lineHeight: 1.6, 
              margin: 0,
              fontFamily: 'var(--font-serif, "Georgia", serif)',
              wordBreak: 'keep-all'
            }}>
              {v.text}
            </p>
          ))}
        </div>
        <div style={{ marginTop: '2rem', fontSize: '0.9rem', opacity: 0.9, fontWeight: 'bold' }}>
          {refText}
        </div>
      </motion.div>

      {/* Controls */}
      <div style={{ marginTop: '2rem', width: '100%', maxWidth: '375px', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
        
        {/* Themes */}
        <div>
          <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', opacity: 0.8 }}>테마 선택</h3>
          <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
            {THEMES.map(t => (
              <button
                key={t.id}
                onClick={() => setTheme(t)}
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '50%',
                  ...t.style,
                  border: theme.id === t.id ? '2px solid white' : '2px solid transparent',
                  cursor: 'pointer',
                  boxShadow: '0 2px 5px rgba(0,0,0,0.3)',
                  color: 'transparent'
                }}
                title={t.name}
              />
            ))}
          </div>
        </div>

        {/* Text Options */}
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', opacity: 0.8 }}>글자 크기</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['small', 'medium', 'large'].map(size => (
                <button
                  key={size}
                  onClick={() => setFontSize(size)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    background: fontSize === size ? 'var(--accent-gold, #c5a880)' : '#333',
                    color: fontSize === size ? '#000' : '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {size === 'small' ? '작게' : size === 'medium' ? '보통' : '크게'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <h3 style={{ fontSize: '1rem', marginBottom: '0.75rem', opacity: 0.8 }}>정렬</h3>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              {['left', 'center'].map(a => (
                <button
                  key={a}
                  onClick={() => setAlign(a)}
                  style={{
                    padding: '0.4rem 0.8rem',
                    background: align === a ? 'var(--accent-gold, #c5a880)' : '#333',
                    color: align === a ? '#000' : '#fff',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                >
                  {a === 'left' ? '좌측' : '중앙'}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem', flexWrap: 'wrap', width: '100%', maxWidth: '375px' }}>
          <button onClick={handleDownload} style={actionBtnStyle}>이미지로 저장</button>
          <button onClick={handleShare} style={actionBtnStyle}>공유하기</button>
          <button onClick={() => navigate(-1)} style={{...actionBtnStyle, background: '#444', color: '#fff'}}>닫기</button>
        </div>
      </div>
    </div>
  );
}

const actionBtnStyle = {
  flex: 1,
  padding: '0.8rem',
  background: 'var(--accent-gold, #d4af37)',
  color: '#000',
  border: 'none',
  borderRadius: '8px',
  fontWeight: 'bold',
  cursor: 'pointer',
  fontSize: '1rem'
};
