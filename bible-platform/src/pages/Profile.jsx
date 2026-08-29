import React, { useContext, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Bookmark, History, Trash2, User, Bell, RefreshCw, Shield, ChevronRight, Edit3, X, Check, Award } from 'lucide-react';
import { UserContext } from '../context/UserContext';
import { messaging, getToken, VAPID_KEY } from '../services/firebase';
import { db } from '../services/firebase';
import { doc, setDoc } from 'firebase/firestore';
import CertificateModal from '../components/CertificateModal';
import { CHURCH_DEPARTMENT_NAMES } from '../data/churchDepartments';

import Stats from './Stats';

// ── 프로필 정보 (이름, 직분, 구역) 수정 모달 ──
const EditProfileModal = ({ initialName, initialPosition, initialDistrict, onSave, onClose }) => {
  const [name, setName] = useState(initialName || '');
  const [position, setPosition] = useState(initialPosition || '');
  const [district, setDistrict] = useState(initialDistrict || '');
  const [saving, setSaving] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    await onSave({ displayName: name.trim(), position, district });
    setSaving(false);
    onClose();
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.75)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, padding: '1.5rem',
      backdropFilter: 'blur(8px)',
    }}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        style={{
          background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)',
          borderRadius: '20px', padding: '1.75rem', width: '100%', maxWidth: '400px',
          boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
          <h3 style={{ color: 'var(--accent-gold)', fontSize: '1.2rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <Edit3 size={18} /> 프로필 정보 수정
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '0.2rem' }}>
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
              성도 이름 / 닉네임 *
            </label>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="이름을 입력해주세요"
              required
              style={{
                width: '100%', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                borderRadius: '12px', padding: '0.75rem 1rem', color: 'var(--text-primary)', fontSize: '0.95rem',
              }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
              교회 직분
            </label>
            <select
              value={position}
              onChange={e => setPosition(e.target.value)}
              style={{
                width: '100%', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                borderRadius: '12px', padding: '0.75rem 1rem', color: 'var(--text-primary)', fontSize: '0.95rem',
              }}
            >
              <option value="">직분을 선택해주세요</option>
              {['성도', '집사', '권사', '장로', '전도사', '목사', '사모', '청년', '어린이/청소년'].map(p => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '0.4rem', fontWeight: 600 }}>
              소속 기관 / 부서 *
            </label>
            <select
              value={district}
              onChange={e => setDistrict(e.target.value)}
              style={{
                width: '100%', background: 'var(--glass-bg)', border: '1px solid var(--glass-border)',
                borderRadius: '12px', padding: '0.75rem 1rem', color: 'var(--text-primary)', fontSize: '0.95rem',
              }}
            >
              <option value="">소속 기관을 선택해주세요</option>
              {CHURCH_DEPARTMENT_NAMES.map(dept => (
                <option key={dept} value={dept}>{dept}</option>
              ))}
            </select>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
            <button
              type="submit"
              disabled={saving || !name.trim()}
              style={{
                flex: 1, background: 'linear-gradient(135deg, var(--accent-gold), #b8860b)',
                border: 'none', borderRadius: '12px', color: '#1a1400',
                padding: '0.85rem', fontWeight: 700, fontSize: '0.95rem', cursor: 'pointer',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.4rem',
                opacity: saving ? 0.7 : 1,
              }}
            >
              <Check size={18} /> {saving ? '저장 중...' : '변경사항 저장'}
            </button>
            <button
              type="button"
              onClick={onClose}
              style={{
                background: 'transparent', border: '1px solid var(--glass-border)',
                borderRadius: '12px', color: 'var(--text-secondary)', padding: '0.85rem 1.25rem',
                cursor: 'pointer', fontSize: '0.9rem',
              }}
            >
              취소
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Profile = () => {
  const { favorites, devotions, planProgress, toggleFavorite, currentUser, memberProfile, isAdmin, updateMemberProfile, loginWithGoogle, logout, cloudSynced, forceSync, showToast, openInstallModal, isStandalone } = useContext(UserContext);
  const { completedDays, totalDays } = planProgress;
  const pct = ((completedDays.length / totalDays) * 100).toFixed(1);

  // 프로필 정보 설정
  const displayName = currentUser ? (memberProfile?.displayName || currentUser.displayName) : '로그인되지 않음';
  const photoUrl = currentUser ? currentUser.photoURL : null;

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isCertModalOpen, setIsCertModalOpen] = useState(false);

  const [pushEnabled, setPushEnabled] = useState(() => localStorage.getItem('push_enabled') === 'true');
  const [notifHour, setNotifHour] = useState(() => parseInt(localStorage.getItem('push_hour') || '8', 10));
  const [notifMinute, setNotifMinute] = useState(() => parseInt(localStorage.getItem('push_minute') || '0', 10));
  const [registering, setRegistering] = useState(false);

  // FCM 토큰 등록 & Firestore 저장
  const registerFCMToken = async (hour, minute) => {
    try {
      // 서비스 워커 등록 (GitHub Pages 경로 문제 해결)
      const swUrl = `${import.meta.env.BASE_URL}firebase-messaging-sw.js`;
      const swReg = await navigator.serviceWorker.register(swUrl);

      // FCM 토큰 발급 (VAPID 키 필요)
      const token = await getToken(messaging, {
        vapidKey: VAPID_KEY,
        serviceWorkerRegistration: swReg
      });

      if (!token) {
        showToast && showToast('FCM 토큰 발급 실패. Firebase Console에서 VAPID 키를 확인해주세요.');
        return false;
      }

      // Firestore에 토큰 + 알림 시간 저장
      const uid = currentUser?.uid || 'anonymous_' + Date.now();
      await setDoc(doc(db, 'fcmTokens', uid), {
        token,
        notifHour: hour,
        notifMinute: minute,
        enabled: true,
        displayName: currentUser?.displayName || '익명',
        updatedAt: new Date().toISOString()
      });

      localStorage.setItem('fcm_token', token);
      return true;
    } catch (err) {
      console.error('FCM 등록 오류:', err);
      return false;
    }
  };

  const handlePushToggle = async () => {
    if (!pushEnabled) {
      if (!('Notification' in window) || !('serviceWorker' in navigator)) {
        showToast && showToast('이 브라우저는 푸시 알림을 지원하지 않습니다.');
        return;
      }
      let permission = Notification.permission;
      if (permission === 'default') {
        permission = await Notification.requestPermission();
      }
      if (permission !== 'granted') {
        showToast && showToast('알림 권한이 거부되었습니다. 브라우저 설정에서 허용해주세요.');
        return;
      }

      setRegistering(true);
      const ok = await registerFCMToken(notifHour, notifMinute);
      setRegistering(false);

      if (ok) {
        setPushEnabled(true);
        localStorage.setItem('push_enabled', 'true');
        showToast && showToast(`✅ 매일 ${notifHour}시 ${String(notifMinute).padStart(2,'0')}분에 백그라운드 알림이 울립니다! 🔔`);
      } else {
        showToast && showToast('알림 등록에 실패했습니다. 잠시 후 다시 시도해주세요.');
      }
    } else {
      // 알림 해제
      const uid = currentUser?.uid;
      if (uid) {
        await setDoc(doc(db, 'fcmTokens', uid), { enabled: false, updatedAt: new Date().toISOString() }, { merge: true });
      }
      setPushEnabled(false);
      localStorage.setItem('push_enabled', 'false');
      showToast && showToast('알림이 해제되었습니다.');
    }
  };

  const handleTimeChange = async (hour, minute) => {
    setNotifHour(hour);
    setNotifMinute(minute);
    localStorage.setItem('push_hour', hour);
    localStorage.setItem('push_minute', minute);
    // 이미 활성화된 경우 Firestore도 업데이트
    if (pushEnabled && currentUser?.uid) {
      await setDoc(doc(db, 'fcmTokens', currentUser.uid), {
        notifHour: hour,
        notifMinute: minute,
        updatedAt: new Date().toISOString()
      }, { merge: true });
      showToast && showToast(`알림 시간이 ${hour}시 ${String(minute).padStart(2,'0')}분으로 변경되었습니다.`);
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} style={{ maxWidth: '820px', margin: '0 auto' }}>
      {/* Profile Header */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-gold), #8B6914)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
          {photoUrl ? <img src={photoUrl} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={40} color="#fff" />}
        </div>
        <div style={{ flex: 1, minWidth: 0, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <h2 className="serif-font" style={{ fontSize: '1.8rem', margin: 0 }}>{displayName}</h2>
            {currentUser && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                {memberProfile?.position && (
                  <span style={{
                    fontSize: '0.78rem', fontWeight: 700, padding: '0.2rem 0.75rem', borderRadius: '20px',
                    background: 'rgba(212,175,55,0.18)', color: 'var(--accent-gold)',
                    border: '1px solid rgba(212,175,55,0.4)',
                  }}>
                    {memberProfile.position}
                  </span>
                )}
                {memberProfile?.district && (
                  <span style={{
                    fontSize: '0.78rem', fontWeight: 600, padding: '0.2rem 0.75rem', borderRadius: '20px',
                    background: 'rgba(255,255,255,0.08)', color: 'var(--text-secondary)',
                    border: '1px solid var(--glass-border)',
                  }}>
                    {memberProfile.district}
                  </span>
                )}
                <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.7rem', borderRadius: '20px',
                  background: cloudSynced ? 'rgba(76,175,80,0.15)' : 'rgba(255,152,0,0.15)',
                  color: cloudSynced ? '#81c784' : '#ffb74d',
                  border: `1px solid ${cloudSynced ? '#81c784' : '#ffb74d'}` }}>
                  {cloudSynced ? '☁️ 동기화됨' : '⚠️ 동기화 대기'}
                </span>
                {!cloudSynced && (
                  <button
                    onClick={async () => {
                      if (forceSync) {
                        await forceSync();
                      } else if (showToast) {
                        showToast('Firebase 보안 규칙을 먼저 업데이트해주세요.');
                      }
                    }}
                    style={{ fontSize: '0.72rem', padding: '0.2rem 0.7rem', borderRadius: '20px',
                      background: 'transparent', border: '1px solid #ffb74d', color: '#ffb74d',
                      cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                  >
                    <RefreshCw size={12} /> 재시도
                  </button>
                )}
              </div>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.65rem' }}>
            즐겨찾기 {favorites.length}개 · 묵상 {devotions.length}편 · 통독 진행률 {pct}%
          </p>
          {!currentUser ? (
            <div>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.82rem', marginBottom: '0.6rem' }}>
                🔒 로그인하면 즐겨찾기·묵상·통독 진행률이 클라우드에 자동 저장됩니다.<br/>
                캐시를 지우거나 폰을 바꿔도 데이터가 유지됩니다.
              </p>
              <button onClick={loginWithGoogle} style={{ padding: '0.5rem 1.2rem', background: '#4285F4', color: '#fff', border: 'none', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                Google 계정으로 로그인 (클라우드 연동)
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', alignItems: 'center' }}>
              <button
                onClick={() => setIsCertModalOpen(true)}
                style={{
                  padding: '0.45rem 1.1rem',
                  background: 'linear-gradient(135deg, rgba(212,175,55,0.3), rgba(168,85,247,0.25))',
                  color: 'var(--accent-gold)',
                  border: '1px solid rgba(212,175,55,0.5)',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 700,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                  boxShadow: '0 2px 8px rgba(212,175,55,0.2)'
                }}
              >
                <Award size={14} /> 🎓 52주 공인 수료증 발급
              </button>
              <button
                onClick={() => setIsEditModalOpen(true)}
                style={{
                  padding: '0.45rem 1.1rem',
                  background: 'rgba(212,175,55,0.15)',
                  color: 'var(--accent-gold)',
                  border: '1px solid rgba(212,175,55,0.4)',
                  borderRadius: '20px',
                  cursor: 'pointer',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.4rem',
                }}
              >
                <Edit3 size={14} /> 이름·직분 수정
              </button>
              <button onClick={logout} style={{ padding: '0.45rem 1rem', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--text-secondary)', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem' }}>
                로그아웃
              </button>
            </div>
          )}
          <div style={{ width: '200px', height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', marginTop: '1rem', overflow: 'hidden' }}>
            <motion.div style={{ height: '100%', background: 'var(--accent-gold)', borderRadius: '3px' }}
              initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }} />
          </div>
        </div>
      </div>

      {/* 이름/직분 수정 모달 */}
      {isEditModalOpen && (
        <EditProfileModal
          initialName={displayName}
          initialPosition={memberProfile?.position || ''}
          initialDistrict={memberProfile?.district || ''}
          onSave={updateMemberProfile}
          onClose={() => setIsEditModalOpen(false)}
        />
      )}

      {/* 관리자 전용 바로가기 배너 */}
      {isAdmin && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            background: 'linear-gradient(135deg, rgba(212,175,55,0.15), rgba(184,134,11,0.05))',
            border: '1px solid rgba(212,175,55,0.4)',
            borderRadius: '16px',
            padding: '1.25rem 1.5rem',
            marginBottom: '2rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '1rem',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.9rem' }}>
            <div style={{
              width: '44px', height: '44px', borderRadius: '12px',
              background: 'rgba(212,175,55,0.2)', border: '1px solid rgba(212,175,55,0.4)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.4rem', flexShrink: 0,
            }}>
              👑
            </div>
            <div>
              <div style={{ fontWeight: 700, color: 'var(--accent-gold)', fontSize: '1.05rem', marginBottom: '0.2rem' }}>
                성도 가입 승인 관리 센터
              </div>
              <div style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                새로 가입 신청한 성도님들을 확인하고 원클릭으로 승인/관리할 수 있습니다.
              </div>
            </div>
          </div>
          <Link
            to="/admin"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '0.4rem',
              background: 'linear-gradient(135deg, var(--accent-gold), #b8860b)',
              color: '#1a1400',
              fontWeight: 700,
              fontSize: '0.9rem',
              padding: '0.65rem 1.25rem',
              borderRadius: '12px',
              textDecoration: 'none',
              boxShadow: '0 4px 15px rgba(212,175,55,0.25)',
              whiteSpace: 'nowrap',
            }}
          >
            대시보드 열기 <ChevronRight size={16} />
          </Link>
        </motion.div>
      )}

      {/* Embed Stats Component Here */}
      <div style={{ marginBottom: '2rem' }}>
        <Stats />
      </div>

      {/* Push Notifications Settings */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ background: 'rgba(196,164,132,0.1)', padding: '0.6rem', borderRadius: '50%' }}>
              <Bell size={20} color="var(--accent-gold)" />
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)' }}>매일 묵상 알림</h4>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {pushEnabled ? `매일 ${notifHour}시 ${String(notifMinute).padStart(2,'0')}분에 알림을 받습니다. 🔔` : '알림이 해제되어 있습니다.'}
              </p>
            </div>
          </div>

          {/* iOS style toggle switch */}
          <div
            onClick={handlePushToggle}
            style={{
              width: '50px', height: '28px', borderRadius: '14px',
              background: pushEnabled ? '#81c784' : 'var(--glass-border)',
              display: 'flex', alignItems: 'center', cursor: 'pointer',
              padding: '2px', transition: 'background 0.3s', flexShrink: 0
            }}
          >
            <motion.div
              layout
              style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#fff', boxShadow: '0 2px 5px rgba(0,0,0,0.2)' }}
              animate={{ x: pushEnabled ? 22 : 0 }}
              transition={{ type: 'spring', stiffness: 500, damping: 30 }}
            />
          </div>
        </div>

        {/* 시간 선택 (always visible) */}
        <div style={{ marginTop: '1.2rem', paddingTop: '1rem', borderTop: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', minWidth: '70px' }}>⏰ 알림 시간</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <select
              value={notifHour}
              onChange={(e) => handleTimeChange(Number(e.target.value), notifMinute)}
              style={{ padding: '0.4rem 0.7rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '1rem', cursor: 'pointer' }}
            >
              {Array.from({ length: 24 }, (_, i) => (
                <option key={i} value={i}>{String(i).padStart(2,'0')}시</option>
              ))}
            </select>
            <span style={{ color: 'var(--text-secondary)', fontWeight: 'bold' }}>:</span>
            <select
              value={notifMinute}
              onChange={(e) => handleTimeChange(notifHour, Number(e.target.value))}
              style={{ padding: '0.4rem 0.7rem', borderRadius: '8px', background: 'var(--bg-secondary)', border: '1px solid var(--glass-border)', color: 'var(--text-primary)', fontSize: '1rem', cursor: 'pointer' }}
            >
              {[0, 5, 10, 15, 20, 25, 30, 35, 40, 45, 50, 55].map(m => (
                <option key={m} value={m}>{String(m).padStart(2,'0')}분</option>
              ))}
            </select>
          </div>
          {!pushEnabled && (
            <span style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>알림 활성화 후 적용됩니다</span>
          )}
        </div>
      </div>

      {/* 📱 스마트폰 홈 화면 앱 설치 관리 카드 */}
      <div className="glass-card" style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
            <div style={{ width: '42px', height: '42px', borderRadius: '12px', background: 'rgba(212,175,55,0.15)', border: '1px solid rgba(212,175,55,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', flexShrink: 0 }}>
              📱
            </div>
            <div>
              <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)' }}>스마트폰 홈 화면 앱 설치</h4>
              <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                {isStandalone ? '✅ 현재 화도벧엘교회 전용 앱으로 실행 중입니다.' : '앱스토어 없이 1초 만에 스마트폰 앱으로 설치하여 전체 화면으로 이용하세요.'}
              </p>
            </div>
          </div>
          <button
            onClick={openInstallModal}
            style={{
              padding: '0.6rem 1.2rem',
              borderRadius: '12px',
              background: isStandalone ? 'rgba(16,185,129,0.15)' : 'linear-gradient(135deg, #d4af37, #f3e5ab)',
              border: isStandalone ? '1px solid #10b981' : 'none',
              color: isStandalone ? '#10b981' : '#1a1400',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              boxShadow: isStandalone ? 'none' : '0 4px 12px rgba(212,175,55,0.35)',
              whiteSpace: 'nowrap'
            }}
          >
            {isStandalone ? '설치 완료 ✅' : '📱 홈 화면에 설치하기'}
          </button>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(320px, 100%), 1fr))', gap: '2rem' }}>
        {/* Favorites */}
        <div className="glass-card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.2rem' }}>
            <Bookmark size={20} color="var(--accent-gold)" /> 즐겨찾기 ({favorites.length})
          </h3>
          {favorites.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>아직 저장된 말씀이 없습니다.<br/>성경 읽기 화면에서 구절을 저장해 보세요.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {favorites.map((f, i) => (
                <div key={f.ref} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start',
                  padding: '1rem', borderRadius: '10px', background: 'var(--bg-secondary)', gap: '1rem' }}>
                  <div style={{ flex: 1, minWidth: 0, wordBreak: 'break-word', overflowWrap: 'anywhere' }}>
                    <p className="serif-font" style={{ fontSize: '0.95rem', marginBottom: '0.3rem' }}>"{f.text}"</p>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-gold)' }}>{f.ref}</span>
                  </div>
                  <button onClick={() => toggleFavorite(f)} style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', flexShrink: 0 }}>
                    <Trash2 size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Recent Devotions */}
        <div className="glass-card">
          <h3 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.5rem', fontSize: '1.2rem' }}>
            <History size={20} color="var(--accent-gold)" /> 최근 묵상 기록 ({devotions.length})
          </h3>
          {devotions.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)', textAlign: 'center', padding: '2rem 0' }}>작성된 묵상이 없습니다.<br/>묵상 탭에서 오늘의 묵상을 시작해 보세요.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {devotions.slice(0, 4).map((d) => (
                <div key={d.id} style={{ padding: '1rem', borderRadius: '10px', background: 'var(--bg-secondary)' }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', marginBottom: '0.3rem' }}>
                    {new Date(d.createdAt).toLocaleDateString('ko-KR')}
                  </p>
                  <h4 className="serif-font" style={{ fontSize: '1rem', marginBottom: '0.3rem' }}>{d.verse}</h4>
                  {d.feeling && <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem', overflow: 'hidden', WebkitLineClamp: 2, display: '-webkit-box', WebkitBoxOrient: 'vertical' }}>{d.feeling}</p>}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* 52주 완주 골든벨 공인 수료증 모달 */}
      {(() => {
        let completedQuizWeeks = 0;
        try {
          const raw = localStorage.getItem('quiz_completed_scores');
          if (raw) {
            const parsed = JSON.parse(raw);
            completedQuizWeeks = Object.keys(parsed).filter(k => k.startsWith('week_')).length;
          }
        } catch (e) {}
        return (
          <CertificateModal
            isOpen={isCertModalOpen}
            onClose={() => setIsCertModalOpen(false)}
            userProfile={memberProfile}
            currentUser={currentUser}
            completedWeeksCount={completedQuizWeeks}
            totalScore={completedQuizWeeks * 15}
          />
        );
      })()}
    </motion.div>
  );
};

export default Profile;
