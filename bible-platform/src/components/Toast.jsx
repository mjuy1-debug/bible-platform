import React, { useEffect, useState } from 'react';
import { CheckCircle, X, AlertCircle } from 'lucide-react';

const Toast = ({ message, type = 'success' }) => {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    setTimeout(() => setVisible(true), 10);
    return () => setVisible(false);
  }, []);

  const bg = type === 'success' ? '#2d6a4f' : type === 'error' ? '#9b2335' : '#1a3a5c';
  const icon = type === 'success' ? <CheckCircle size={18} /> : <AlertCircle size={18} />;

  return (
    <div style={{
      position: 'fixed', bottom: '2rem', right: '2rem', zIndex: 9999,
      background: bg, color: '#fff',
      padding: '1rem 1.5rem', borderRadius: '12px',
      display: 'flex', alignItems: 'center', gap: '0.8rem',
      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
      transform: visible ? 'translateY(0)' : 'translateY(20px)',
      opacity: visible ? 1 : 0,
      transition: 'all 0.4s cubic-bezier(0.16,1,0.3,1)',
      maxWidth: '320px', fontFamily: 'var(--font-sans)'
    }}>
      {icon}
      <span style={{ flex: 1, fontSize: '0.95rem' }}>{message}</span>
    </div>
  );
};

export default Toast;
