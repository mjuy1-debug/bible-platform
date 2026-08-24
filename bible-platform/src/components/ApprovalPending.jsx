import React, { useState, useContext } from 'react';
import { motion } from 'framer-motion';
import { UserContext } from '../context/UserContext';

const ApprovalPending = ({ userProfile, onEditProfile }) => {
  const { currentUser, logout } = useContext(UserContext);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--bg-primary)',
        padding: '2rem 1.5rem',
        textAlign: 'center',
      }}
    >
      <motion.div
        animate={{ scale: [1, 1.05, 1] }}
        transition={{ repeat: Infinity, duration: 3, ease: 'easeInOut' }}
        style={{ fontSize: '4rem', marginBottom: '1rem' }}
      >
        ⛪
      </motion.div>

      <h1 style={{
        fontSize: '1.6rem', fontWeight: 700, color: 'var(--accent-gold)',
        marginBottom: '0.5rem', fontFamily: 'var(--font-serif)',
      }}>
        벧엘교회 말씀 플랫폼
      </h1>

      <div style={{
        display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
        background: 'rgba(255,200,0,0.12)', border: '1px solid rgba(255,200,0,0.4)',
        borderRadius: '999px', padding: '0.4rem 1.2rem', marginBottom: '2rem',
        color: '#ffd700', fontSize: '0.9rem', fontWeight: 600,
      }}>
        <motion.span animate={{ opacity: [1, 0.3, 1] }} transition={{ repeat: Infinity, duration: 1.5 }}>●</motion.span>
        승인 대기 중
      </div>

      {currentUser && (
        <div style={{
          background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
          borderRadius: '16px', padding: '1.5rem 2rem', marginBottom: '2rem',
          width: '100%', maxWidth: '380px', backdropFilter: 'blur(12px)',
        }}>
          <img
            src={currentUser.photoURL || 'https://ui-avatars.com/api/?name=' + encodeURIComponent(currentUser.displayName || '성도')}
            alt="프로필"
            style={{ width: '64px', height: '64px', borderRadius: '50%', border: '2px solid var(--accent-gold)', marginBottom: '0.75rem', objectFit: 'cover' }}
          />
          <div style={{ fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
            {currentUser.displayName || '이름 미설정'}
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.75rem' }}>
            {currentUser.email}
          </div>
          {userProfile?.position && (
            <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'center', flexWrap: 'wrap' }}>
              <span style={{ background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', borderRadius: '999px', padding: '0.25rem 0.8rem', fontSize: '0.8rem', color: 'var(--accent-gold)' }}>
                {userProfile.position}
              </span>
              {userProfile.district && (
                <span style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid var(--glass-border)', borderRadius: '999px', padding: '0.25rem 0.8rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  {userProfile.district}
                </span>
              )}
            </div>
          )}
        </div>
      )}

      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)',
        borderRadius: '14px', padding: '1.5rem', maxWidth: '420px', marginBottom: '2rem', textAlign: 'left',
      }}>
        <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1rem' }}>
          🙏 가입 신청이 완료되었습니다!<br />
          <strong style={{ color: 'var(--accent-gold)' }}>담당 교역자 또는 관리자</strong>가 승인하면 앱의 모든 기능을 이용하실 수 있습니다.
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {['📖 성경 66권 통독 & 낭독', '🧠 401개 말씀 퀴즈', '📝 묵상 노트 & 나눔', '🎵 찬송가 & 말씀 암송 훈련', '📅 교회 일정 & 주보'].map(item => (
            <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--accent-gold)', fontSize: '0.7rem' }}>▶</span> {item}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '300px' }}>
        {onEditProfile && (
          <motion.button whileTap={{ scale: 0.97 }} onClick={onEditProfile} style={{
            background: 'rgba(212,175,55,0.12)', border: '1px solid rgba(212,175,55,0.4)',
            borderRadius: '12px', color: 'var(--accent-gold)', padding: '0.8rem',
            fontSize: '0.9rem', fontWeight: 600, cursor: 'pointer',
          }}>
            ✏️ 직분 / 구역 수정하기
          </motion.button>
        )}
        <motion.button whileTap={{ scale: 0.97 }} onClick={logout} style={{
          background: 'rgba(255,255,255,0.05)', border: '1px solid var(--glass-border)',
          borderRadius: '12px', color: 'var(--text-secondary)', padding: '0.8rem',
          fontSize: '0.9rem', cursor: 'pointer',
        }}>
          로그아웃
        </motion.button>
      </div>

      <p style={{ marginTop: '2rem', fontSize: '0.78rem', color: 'var(--text-secondary)', opacity: 0.6 }}>
        문의: 교회 사무실 또는 담당 목사님께 연락해주세요
      </p>
    </motion.div>
  );
};

export default ApprovalPending;
