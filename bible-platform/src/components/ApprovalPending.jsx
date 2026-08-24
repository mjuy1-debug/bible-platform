import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { UserContext } from '../context/UserContext';
import { ShieldCheck, UserCheck, Edit3, LogOut, CheckCircle2, AlertTriangle } from 'lucide-react';

const ApprovalPending = ({ userProfile, onEditProfile }) => {
  const { currentUser, logout } = useContext(UserContext);

  const displayName = userProfile?.displayName || currentUser?.displayName || '성도';
  const email = userProfile?.email || currentUser?.email || '';
  const photoURL = userProfile?.photoURL || currentUser?.photoURL;
  const position = userProfile?.position;
  const district = userProfile?.district;

  return (
    <div
      style={{
        minHeight: '100dvh',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'flex-start',
        background: 'var(--bg-primary)',
        padding: 'calc(2rem + env(safe-area-inset-top, 0px)) clamp(1rem, 4vw, 1.5rem) calc(2.5rem + env(safe-area-inset-bottom, 0px))',
        overflowY: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}
      className="custom-scrollbar"
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        style={{
          width: '100%',
          maxWidth: '460px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          textAlign: 'center',
        }}
      >
        {/* 상단 교회 로고 & 타이틀 */}
        <motion.div
          animate={{ scale: [1, 1.05, 1] }}
          transition={{ repeat: Infinity, duration: 3.5, ease: 'easeInOut' }}
          style={{ fontSize: '3.2rem', marginBottom: '0.6rem', lineHeight: 1 }}
        >
          ⛪
        </motion.div>

        <h1 style={{
          fontSize: 'clamp(1.4rem, 5vw, 1.8rem)',
          fontWeight: 700,
          color: 'var(--accent-gold)',
          marginBottom: '0.4rem',
          fontFamily: 'var(--font-serif)',
          wordBreak: 'keep-all',
          lineHeight: 1.3,
        }}>
          벧엘교회 말씀 플랫폼
        </h1>

        {/* 승인 상태 뱃지 */}
        <div style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '0.45rem',
          background: 'rgba(255, 215, 0, 0.12)',
          border: '1px solid rgba(255, 215, 0, 0.4)',
          borderRadius: '999px',
          padding: '0.35rem 1.1rem',
          marginBottom: '1.5rem',
          color: '#ffd700',
          fontSize: '0.88rem',
          fontWeight: 700,
        }}>
          <motion.span
            animate={{ opacity: [1, 0.2, 1] }}
            transition={{ repeat: Infinity, duration: 1.5 }}
          >
            ●
          </motion.span>
          가입 승인 대기 중
        </div>

        {/* 성도 프로필 카드 */}
        {currentUser && (
          <div style={{
            background: 'var(--glass-bg)',
            border: '1px solid var(--glass-border)',
            borderRadius: '18px',
            padding: '1.25rem 1.5rem',
            marginBottom: '1.25rem',
            width: '100%',
            backdropFilter: 'blur(16px)',
            WebkitBackdropFilter: 'blur(16px)',
            boxShadow: 'var(--shadow-sm)',
            textAlign: 'center',
          }}>
            <img
              src={photoURL || `https://ui-avatars.com/api/?name=${encodeURIComponent(displayName)}&background=d4af37&color=1a1400`}
              alt="프로필"
              style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                border: '2px solid var(--accent-gold)',
                marginBottom: '0.6rem',
                objectFit: 'cover',
              }}
            />
            <div style={{
              fontWeight: 700,
              fontSize: '1.15rem',
              color: 'var(--text-primary)',
              marginBottom: '0.2rem',
              wordBreak: 'break-word',
            }}>
              {displayName}
            </div>
            <div style={{
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
              marginBottom: position || district ? '0.6rem' : '0.2rem',
              wordBreak: 'break-all',
            }}>
              {email}
            </div>

            {(position || district) && (
              <div style={{ display: 'flex', gap: '0.4rem', justifyContent: 'center', flexWrap: 'wrap' }}>
                {position && (
                  <span style={{
                    background: 'rgba(212, 175, 55, 0.18)',
                    border: '1px solid rgba(212, 175, 55, 0.4)',
                    borderRadius: '999px',
                    padding: '0.2rem 0.75rem',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    color: 'var(--accent-gold)',
                  }}>
                    {position}
                  </span>
                )}
                {district && (
                  <span style={{
                    background: 'rgba(255, 255, 255, 0.08)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '999px',
                    padding: '0.2rem 0.75rem',
                    fontSize: '0.78rem',
                    color: 'var(--text-secondary)',
                  }}>
                    {district}
                  </span>
                )}
              </div>
            )}
          </div>
        )}

        {/* ⚠️ 실명 및 직분 필수 안내 카드 */}
        <div style={{
          background: 'linear-gradient(135deg, rgba(255, 152, 0, 0.14), rgba(212, 175, 55, 0.06))',
          border: '1px solid rgba(255, 152, 0, 0.4)',
          borderRadius: '16px',
          padding: '1.1rem 1.25rem',
          width: '100%',
          marginBottom: '1.25rem',
          textAlign: 'left',
          boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.45rem',
            marginBottom: '0.4rem',
            color: '#ffb74d',
            fontWeight: 700,
            fontSize: '0.92rem',
          }}>
            <AlertTriangle size={17} />
            <span>실명 및 직분 필수 안내</span>
          </div>
          <p style={{
            fontSize: '0.84rem',
            color: 'var(--text-primary)',
            lineHeight: 1.6,
            margin: 0,
            wordBreak: 'keep-all',
          }}>
            교회 성도 확인 및 <strong>신속한 가입 승인</strong>을 위해 구글 닉네임 대신 <strong style={{ color: '#ffd700' }}>[실명(본명)]</strong>과 <strong style={{ color: '#ffd700' }}>[교회 직분/구역]</strong>을 꼭 등록해 주세요!
          </p>
        </div>

        {/* 안내 및 기능 리스트 카드 */}
        <div style={{
          background: 'rgba(255, 255, 255, 0.03)',
          border: '1px solid var(--glass-border)',
          borderRadius: '16px',
          padding: '1.25rem 1.35rem',
          width: '100%',
          marginBottom: '1.75rem',
          textAlign: 'left',
        }}>
          <p style={{
            color: 'var(--text-primary)',
            fontSize: '0.9rem',
            lineHeight: 1.6,
            marginBottom: '0.9rem',
            wordBreak: 'keep-all',
          }}>
            🙏 가입 신청이 정상적으로 접수되었습니다.<br />
            <strong style={{ color: 'var(--accent-gold)' }}>담당 교역자 또는 관리자</strong>가 확인 후 승인하면 모든 기능이 즉시 열립니다.
          </p>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '0.55rem',
            borderTop: '1px solid rgba(255,255,255,0.06)',
            paddingTop: '0.75rem',
          }}>
            {[
              '📖 성경 66권 전권 통독 & AI 음성 낭독',
              '🧠 4,000+개 성경 말씀 퀴즈 (401개 전 세트)',
              '📝 나만의 묵상 노트 & 전교인 나눔터',
              '🎵 새찬송가 645장 전곡 & 말씀 암송 훈련',
              '📅 실시간 교회 일정 & 전자 주보',
            ].map(item => (
              <div
                key={item}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.45rem',
                  color: 'var(--text-secondary)',
                  fontSize: '0.84rem',
                  lineHeight: 1.4,
                  wordBreak: 'keep-all',
                }}
              >
                <CheckCircle2 size={14} color="var(--accent-gold)" style={{ flexShrink: 0 }} />
                <span>{item}</span>
              </div>
            ))}
          </div>
        </div>

        {/* 액션 버튼 */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
          width: '100%',
          maxWidth: '340px',
        }}>
          {onEditProfile && (
            <button
              onClick={onEditProfile}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.5rem',
                background: 'linear-gradient(135deg, var(--accent-gold), #b8860b)',
                border: 'none',
                borderRadius: '14px',
                color: '#1a1400',
                padding: '0.9rem 1.25rem',
                fontSize: '0.95rem',
                fontWeight: 700,
                cursor: 'pointer',
                boxShadow: '0 4px 18px rgba(212,175,55,0.25)',
                width: '100%',
                wordBreak: 'keep-all',
              }}
            >
              <Edit3 size={17} /> 실명 및 직분 / 구역 입력·수정
            </button>
          )}

          <button
            onClick={logout}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.45rem',
              background: 'transparent',
              border: '1px solid var(--glass-border)',
              borderRadius: '14px',
              color: 'var(--text-secondary)',
              padding: '0.8rem 1.25rem',
              fontSize: '0.88rem',
              cursor: 'pointer',
              width: '100%',
            }}
          >
            <LogOut size={16} /> 로그아웃
          </button>
        </div>

        <p style={{
          marginTop: '1.75rem',
          fontSize: '0.78rem',
          color: 'var(--text-secondary)',
          opacity: 0.6,
          lineHeight: 1.4,
          wordBreak: 'keep-all',
        }}>
          문의: 교회 사무실 또는 담당 교역자
        </p>
      </motion.div>
    </div>
  );
};

export default ApprovalPending;
