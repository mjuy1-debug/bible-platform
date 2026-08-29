import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, Smartphone, Share, PlusSquare, X, Check, ArrowRight, ExternalLink, Sparkles, ShieldCheck } from 'lucide-react';

export default function PwaInstallModal({ isOpen, onClose, deferredPrompt, isStandalone }) {
  const [isIOS, setIsIOS] = useState(false);
  const [isKakao, setIsKakao] = useState(false);
  const [installSuccess, setInstallSuccess] = useState(false);

  useEffect(() => {
    const ua = navigator.userAgent || '';
    const isIphone = /iPad|iPhone|iPod/.test(ua) && !window.MSStream;
    const isKakaoTalk = /KAKAOTALK/i.test(ua);
    setIsIOS(isIphone);
    setIsKakao(isKakaoTalk);
  }, []);

  if (!isOpen) return null;

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setInstallSuccess(true);
        setTimeout(() => {
          onClose();
        }, 2000);
      }
    }
  };

  return (
    <AnimatePresence>
      <div
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 99999,
          background: 'rgba(0, 0, 0, 0.82)',
          backdropFilter: 'blur(8px)',
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
          style={{
            background: 'linear-gradient(145deg, #14141d 0%, #1e1d2c 100%)',
            border: '1px solid rgba(212, 175, 55, 0.4)',
            borderRadius: '24px',
            maxWidth: '440px',
            width: '100%',
            overflow: 'hidden',
            boxShadow: '0 25px 60px rgba(0,0,0,0.8), 0 0 30px rgba(212,175,55,0.2)',
            color: '#fff',
            position: 'relative'
          }}
          onClick={(e) => e.stopPropagation()}
        >
          {/* 상단 닫기 버튼 */}
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '16px',
              right: '16px',
              background: 'rgba(255,255,255,0.08)',
              border: 'none',
              borderRadius: '50%',
              width: '32px',
              height: '32px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#9ca3af',
              cursor: 'pointer',
              zIndex: 10
            }}
          >
            <X size={18} />
          </button>

          {/* 헤더 배너 */}
          <div style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.25) 0%, rgba(168,85,247,0.15) 100%)',
            padding: '28px 24px 20px',
            textAlign: 'center',
            borderBottom: '1px solid rgba(212,175,55,0.2)'
          }}>
            <div style={{
              width: '64px',
              height: '64px',
              margin: '0 auto 12px',
              borderRadius: '16px',
              boxShadow: '0 8px 20px rgba(0,0,0,0.5)',
              overflow: 'hidden',
              border: '2px solid rgba(212,175,55,0.6)',
              background: '#0d0d12',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              <img
                src='https://mjuy1-debug.github.io/bible-platform/icon-192.png'
                alt='벧엘교회 아이콘'
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>

            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', color: 'var(--accent-gold)', marginBottom: '4px' }}>
              <Sparkles size={14} />
              <span style={{ fontSize: '12px', fontWeight: 800, letterSpacing: '1px' }}>화도벧엘교회 공식 앱</span>
              <Sparkles size={14} />
            </div>

            <h2 style={{ fontSize: '1.35rem', fontWeight: 900, margin: '2px 0 6px', color: '#fff' }}>
              스마트폰 홈 화면에 앱 설치
            </h2>
            <p style={{ fontSize: '0.82rem', color: '#d1d5db', margin: 0, lineHeight: 1.5, wordBreak: 'keep-all' }}>
              앱스토어 다운로드 없이 <strong>1초 만에 스마트폰 앱으로 설치</strong>하여 매일 아침 말씀 알림을 수신하세요!
            </p>
          </div>

          {/* 본문 내용 */}
          <div style={{ padding: '20px 22px' }}>
            {/* 이미 설치되어 있는 경우 */}
            {isStandalone ? (
              <div style={{
                background: 'rgba(16,185,129,0.12)',
                border: '1px solid rgba(16,185,129,0.4)',
                borderRadius: '16px',
                padding: '16px',
                textAlign: 'center',
                color: '#34d399'
              }}>
                <div style={{ fontSize: '1.8rem', marginBottom: '6px' }}>🎉</div>
                <div style={{ fontWeight: 800, fontSize: '1rem', marginBottom: '4px' }}>
                  이미 앱으로 실행 중입니다!
                </div>
                <div style={{ fontSize: '0.8rem', color: '#a7f3d0' }}>
                  홈 화면의 화도벧엘교회 앱 아이콘을 통해 언제든 편리하게 이용하실 수 있습니다.
                </div>
              </div>
            ) : installSuccess ? (
              <div style={{
                background: 'rgba(16,185,129,0.15)',
                border: '1px solid rgba(16,185,129,0.5)',
                borderRadius: '16px',
                padding: '20px',
                textAlign: 'center',
                color: '#34d399'
              }}>
                <Check size={36} style={{ margin: '0 auto 8px' }} />
                <div style={{ fontWeight: 900, fontSize: '1.1rem', marginBottom: '4px' }}>
                  앱 설치가 완료되었습니다!
                </div>
                <div style={{ fontSize: '0.82rem', color: '#a7f3d0' }}>
                  스마트폰 홈 화면에서 ‘화도벧엘교회’ 아이콘을 확인해보세요.
                </div>
              </div>
            ) : (
              <div>
                {/* 1. 카카오톡 인앱 브라우저 안내 */}
                {isKakao && (
                  <div style={{
                    background: 'rgba(250, 204, 21, 0.12)',
                    border: '1px solid rgba(250, 204, 21, 0.4)',
                    borderRadius: '14px',
                    padding: '12px 14px',
                    marginBottom: '14px',
                    fontSize: '0.82rem',
                    color: '#fef08a',
                    lineHeight: 1.5,
                    wordBreak: 'keep-all'
                  }}>
                    ⚠️ <strong>카카오톡 인앱 브라우저로 접속하셨습니다.</strong><br />
                    우측 상단 <strong>더보기(⋮)</strong> 또는 우측 하단 <strong>(⋯)</strong>를 누른 후 <strong>[다른 브라우저로 열기 (Safari/Chrome)]</strong>를 선택하셔야 원클릭 앱 설치가 가능합니다.
                  </div>
                )}

                {/* 2. 안드로이드 / 크롬 원클릭 설치 버튼 */}
                {deferredPrompt ? (
                  <div style={{ marginBottom: '16px' }}>
                    <button
                      onClick={handleInstallClick}
                      style={{
                        width: '100%',
                        padding: '14px',
                        borderRadius: '14px',
                        background: 'linear-gradient(135deg, #d4af37 0%, #f3e5ab 50%, #aa820a 100%)',
                        color: '#1a1400',
                        fontSize: '1rem',
                        fontWeight: 900,
                        border: 'none',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '8px',
                        boxShadow: '0 4px 18px rgba(212,175,55,0.4)',
                        transition: 'transform 0.1s'
                      }}
                    >
                      <Download size={20} /> 📱 지금 바로 홈 화면에 설치하기
                    </button>
                  </div>
                ) : isIOS ? (
                  /* 3. 아이폰 / 아이패드 (iOS 사파리) 가이드 */
                  <div style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '16px',
                    padding: '16px',
                    marginBottom: '16px'
                  }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Smartphone size={16} /> 아이폰(iOS Safari) 설치 방법
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', fontSize: '0.84rem', color: '#e5e7eb' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent-gold)', color: '#000', fontSize: '11px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>1</span>
                        <span>사파리(Safari) 화면 하단 중앙의 <strong>공유 아이콘 (<Share size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />)</strong> 클릭</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent-gold)', color: '#000', fontSize: '11px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>2</span>
                        <span>메뉴를 올려 <strong>[홈 화면에 추가 <PlusSquare size={14} style={{ display: 'inline', verticalAlign: 'middle' }} />]</strong> 선택</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <span style={{ width: '22px', height: '22px', borderRadius: '50%', background: 'var(--accent-gold)', color: '#000', fontSize: '11px', fontWeight: 900, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>3</span>
                        <span>우측 상단 <strong>[추가]</strong>를 누르면 설치 완료!</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  /* 4. 일반 브라우저 안내 */
                  <div style={{
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--glass-border)',
                    borderRadius: '16px',
                    padding: '16px',
                    marginBottom: '16px',
                    fontSize: '0.84rem',
                    color: '#e5e7eb'
                  }}>
                    <div style={{ fontSize: '0.9rem', fontWeight: 800, color: 'var(--accent-gold)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Smartphone size={16} /> 홈 화면에 바로가기 추가 방법
                    </div>
                    <div style={{ lineHeight: 1.6, wordBreak: 'keep-all' }}>
                      브라우저 우측 상단 메뉴 <strong>(⋮)</strong>를 누르고 <strong>[홈 화면에 추가]</strong> 또는 <strong>[앱 설치]</strong>를 선택하시면 즉시 스마트폰 앱으로 설치됩니다.
                    </div>
                  </div>
                )}

                {/* 앱 설치 시 좋은 점 */}
                <div style={{
                  borderTop: '1px dashed rgba(255,255,255,0.1)',
                  paddingTop: '14px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '6px',
                  fontSize: '0.78rem',
                  color: '#9ca3af'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Check size={14} color='#10b981' /> 주소창 없는 깔끔한 전체 화면 앱 실행
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Check size={14} color='#10b981' /> 매일 아침 '오늘의 말씀' 푸시 알림 완벽 지원
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Check size={14} color='#10b981' /> 성경 통독, 52주 골든벨 퀴즈, 실시간 예배 원터치 접속
                  </div>
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
