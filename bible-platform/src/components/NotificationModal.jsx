// src/components/NotificationModal.jsx
import React, { useState, useEffect, useContext } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Bell, BellRing, BellOff, Clock, Sparkles, Check, X, ShieldAlert, Send } from 'lucide-react';
import { UserContext } from '../context/UserContext';
import { 
  getNotificationSettings, 
  saveNotificationSettings, 
  requestNotificationPermission, 
  sendTestNotification 
} from '../services/notificationService';

export default function NotificationModal({ isOpen, onClose }) {
  const { currentUser, showToast } = useContext(UserContext);
  const [settings, setSettings] = useState(getNotificationSettings);
  const [permission, setPermission] = useState(
    typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default'
  );
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setSettings(getNotificationSettings());
      if ('Notification' in window) {
        setPermission(Notification.permission);
      }
    }
  }, [isOpen]);

  const handleToggleEnable = async () => {
    if (!settings.enabled || permission !== 'granted') {
      setLoading(true);
      const res = await requestNotificationPermission(currentUser);
      setLoading(false);

      if (res.ok) {
        setPermission('granted');
        const updated = { ...settings, enabled: true };
        setSettings(updated);
        saveNotificationSettings(updated);
        if (showToast) showToast('🔔 말씀 알림이 성공적으로 설정되었습니다!');
      } else {
        if (showToast) showToast(`❌ 알림 설정 실패: ${res.error}`);
      }
    } else {
      const updated = { ...settings, enabled: false };
      setSettings(updated);
      saveNotificationSettings(updated);
      if (showToast) showToast('말씀 알림이 일시 중지되었습니다.');
    }
  };

  const handleTimeChange = (e) => {
    const time = e.target.value;
    const updated = { ...settings, morningTime: time };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleTopicToggle = (topicKey) => {
    const updated = {
      ...settings,
      topics: {
        ...settings.topics,
        [topicKey]: !settings.topics[topicKey]
      }
    };
    setSettings(updated);
    saveNotificationSettings(updated);
  };

  const handleSendTest = () => {
    if (permission !== 'granted') {
      if (showToast) showToast('먼저 상단의 알림 권한을 켜주세요! 🔔');
      return;
    }
    const ok = sendTestNotification();
    if (ok) {
      if (showToast) showToast('✨ 화면 상단에 테스트 알림이 발송되었습니다!');
    } else {
      if (showToast) showToast('알림 발송에 실패했습니다. 브라우저 권한을 확인해주세요.');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        background: 'rgba(0, 0, 0, 0.75)',
        backdropFilter: 'blur(6px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '16px'
      }} onClick={onClose}>
        <motion.div
          initial={{ opacity: 0, scale: 0.92, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.92, y: 20 }}
          onClick={(e) => e.stopPropagation()}
          style={{
            background: 'var(--bg-secondary)',
            border: '1px solid var(--glass-border)',
            borderRadius: '24px',
            maxWidth: '480px',
            width: '100%',
            padding: 'clamp(1.2rem, 4vw, 1.8rem)',
            color: 'var(--text-primary)',
            boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6)',
            boxSizing: 'border-box',
            position: 'relative'
          }}
        >
          {/* 닫기 버튼 */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'none',
              border: 'none',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              padding: '6px'
            }}
          >
            <X size={20} />
          </button>

          {/* 헤더 */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.2rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: '14px',
              background: 'rgba(212, 175, 55, 0.15)',
              border: '1px solid rgba(212, 175, 55, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--accent-gold)'
            }}>
              <BellRing size={24} />
            </div>
            <div>
              <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                말씀 & 묵상 알림 설정
              </h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                매일 아침 은혜로운 말씀으로 하루를 시작하세요
              </span>
            </div>
          </div>

          {/* 알림 활성화 마스터 토글 */}
          <div style={{
            background: settings.enabled && permission === 'granted' ? 'rgba(212, 175, 55, 0.12)' : 'rgba(255, 255, 255, 0.03)',
            border: `1px solid ${settings.enabled && permission === 'granted' ? 'var(--accent-gold)' : 'var(--glass-border)'}`,
            borderRadius: '16px',
            padding: '14px 16px',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <div>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {settings.enabled && permission === 'granted' ? '알림이 켜져 있습니다' : '말씀 알림 켜기'}
              </div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                {permission === 'granted' ? '브라우저 알림 권한 허용됨 ✅' : '클릭하여 알림 권한을 허용해주세요'}
              </div>
            </div>

            <button
              onClick={handleToggleEnable}
              disabled={loading}
              style={{
                padding: '8px 16px',
                borderRadius: '12px',
                background: settings.enabled && permission === 'granted' ? 'var(--accent-gold)' : 'rgba(255, 255, 255, 0.1)',
                border: 'none',
                color: settings.enabled && permission === 'granted' ? '#111' : 'var(--text-primary)',
                fontSize: '0.85rem',
                fontWeight: 800,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              {loading ? '연결 중...' : (settings.enabled && permission === 'granted' ? <><Check size={16} /> 켜짐</> : <><Bell size={16} /> 켜기</>)}
            </button>
          </div>

          {/* 세부 알림 옵션 */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '1.2rem' }}>
            {/* 시간 설정 */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '12px 14px',
              borderRadius: '12px',
              background: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--glass-border)'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Clock size={16} color="var(--accent-gold)" />
                <span style={{ fontSize: '0.88rem', fontWeight: 600 }}>아침 말씀 알림 시간</span>
              </div>

              <input
                type="time"
                value={settings.morningTime}
                onChange={handleTimeChange}
                style={{
                  background: 'var(--bg-primary)',
                  border: '1px solid var(--glass-border)',
                  color: 'var(--accent-gold)',
                  borderRadius: '8px',
                  padding: '4px 8px',
                  fontSize: '0.9rem',
                  fontWeight: 700,
                  outline: 'none'
                }}
              />
            </div>

            {/* 주제별 토글 */}
            {[
              { key: 'dailyVerse', label: '📖 매일 아침 오늘의 말씀', desc: '새벽/아침 시간 은혜의 구절 배달' },
              { key: 'prayerWall', label: '🙏 중보 기도 새 나눔', desc: '성도들의 새로운 기도 제목 소식' },
              { key: 'announcements', label: '📢 교회 주보 및 공지사항', desc: '예배 및 주요 교회 일정 알림' }
            ].map(item => (
              <div
                key={item.key}
                onClick={() => handleTopicToggle(item.key)}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 14px',
                  borderRadius: '12px',
                  background: 'rgba(255, 255, 255, 0.02)',
                  border: '1px solid var(--glass-border)',
                  cursor: 'pointer'
                }}
              >
                <div>
                  <div style={{ fontSize: '0.86rem', fontWeight: 700 }}>{item.label}</div>
                  <div style={{ fontSize: '0.74rem', color: 'var(--text-secondary)' }}>{item.desc}</div>
                </div>

                <div style={{
                  width: '20px',
                  height: '20px',
                  borderRadius: '6px',
                  border: `1.5px solid ${settings.topics[item.key] ? 'var(--accent-gold)' : 'rgba(255,255,255,0.3)'}`,
                  background: settings.topics[item.key] ? 'var(--accent-gold)' : 'transparent',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#111'
                }}>
                  {settings.topics[item.key] && <Check size={14} strokeWidth={3} />}
                </div>
              </div>
            ))}
          </div>

          {/* 테스트 버튼 & 안내 */}
          <div style={{ display: 'flex', gap: '8px' }}>
            <button
              onClick={handleSendTest}
              style={{
                flex: 1,
                padding: '12px',
                borderRadius: '12px',
                background: 'rgba(255, 255, 255, 0.06)',
                border: '1px solid var(--glass-border)',
                color: 'var(--text-primary)',
                fontSize: '0.86rem',
                fontWeight: 700,
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px'
              }}
            >
              <Send size={15} color="var(--accent-gold)" /> 테스트 알림 보내기
            </button>

            <button
              onClick={onClose}
              style={{
                padding: '12px 24px',
                borderRadius: '12px',
                background: 'var(--accent-gold)',
                border: 'none',
                color: '#111',
                fontSize: '0.86rem',
                fontWeight: 800,
                cursor: 'pointer'
              }}
            >
              완료
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
