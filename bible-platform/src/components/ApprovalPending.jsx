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

      {/* 실명 및 직분 필수 입력 안내 경고 배너 */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.15), rgba(212, 175, 55, 0.08))',
          border: '1px solid rgba(255, 152, 0, 0.45)',
          borderRadius: '14px',
          padding: '1rem 1.25rem',
          maxWidth: '420px',
          width: '100%',
          marginBottom: '1.5rem',
          textAlign: 'left',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem', color: '#ffb74d', fontWeight: 700, fontSize: '0.95rem' }}>
          <span>⚠️</span> 실명 및 직분 필수 안내
        </div>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', lineHeight: 1.6, margin: 0 }}>
          교회 성도 확인 및 <strong>신속한 가입 승인</strong>을 위해 구글 닉네임 대신 <strong style={{ color: '#ffd700' }}>[실명(본명)]</strong>과 <strong style={{ color: '#ffd700' }}>[교회 직분/구역]</strong>을 꼭 입력해 주세요!
        </p>
      </motion.div>

      <div style={{
        background: 'rgba(255,255,255,0.04)', border: '1px solid var(--glass-border)',
        borderRadius: '14px', padding: '1.5rem', maxWidth: '420px', width: '100%', marginBottom: '2rem', textAlign: 'left',
      }}>
        <p style={{ color: 'var(--text-primary)', fontSize: '0.95rem', lineHeight: 1.7, marginBottom: '1rem' }}>
          🙏 가입 신청이 접수되었습니다!<br />
          <strong style={{ color: 'var(--accent-gold)' }}>담당 교역자 또는 관리자</strong>가 확인 후 승인하면 모든 기능을 이용하실 수 있습니다.
        </p>
        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
          {[
            '📖 성경 66권 전권 통독 & AI 음성 낭독',
            '🧠 4,000+개 성경 말씀 퀴즈 (401개 전 세트)',
            '📝 나만의 묵상 노트 & 전교인 나눔터',
            '🎵 새찬송가 645장 전곡 & 말씀 암송 훈련',
            '📅 실시간 교회 일정 & 전자 주보'
          ].map(item => (
            <li key={item} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.88rem' }}>
              <span style={{ color: 'var(--accent-gold)', fontSize: '0.7rem' }}>▶</span> {item}
            </li>
          ))}
        </ul>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '100%', maxWidth: '320px' }}>
        {onEditProfile && (
          <motion.button whileTap={{ scale: 0.97 }} onClick={onEditProfile} style={{
            background: 'linear-gradient(135deg, var(--accent-gold), #b8860b)',
            border: 'none',
            borderRadius: '12px',
            color: '#1a1400',
            padding: '0.9rem',
            fontSize: '0.95rem',
            fontWeight: 700,
            cursor: 'pointer',
            boxShadow: '0 4px 15px rgba(212,175,55,0.25)',
          }}>
            ✏️ 실명 및 직분 / 구역 입력·수정
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
        문의: 교회 사무실 또는 담당 교역자
      </p>
    </motion.div>
  );
};

export default ApprovalPending;
