import React, { useContext, useState } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, History, Trash2, User, Bell } from 'lucide-react';
import { UserContext } from '../context/UserContext';

const Profile = () => {
  const { favorites, devotions, planProgress, toggleFavorite, currentUser, loginWithGoogle, logout, cloudSynced } = useContext(UserContext);
  const { completedDays, totalDays } = planProgress;
  const pct = ((completedDays.length / totalDays) * 100).toFixed(1);

  // 프로필 정보 설정
  const displayName = currentUser ? currentUser.displayName : '로그인되지 않음';
  const photoUrl = currentUser ? currentUser.photoURL : null;

  const [pushEnabled, setPushEnabled] = useState(false);

  const handlePushToggle = () => {
    if (!pushEnabled) {
      if (window.confirm("알림 권한을 허용하시겠습니까?")) {
        setPushEnabled(true);
        if (typeof window.showToast === 'function') window.showToast("푸시 알림이 활성화되었습니다. 🔔");
      }
    } else {
      setPushEnabled(false);
      if (typeof window.showToast === 'function') window.showToast("푸시 알림이 해제되었습니다.");
    }
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Profile Header */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-gold), #8B6914)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, overflow: 'hidden' }}>
          {photoUrl ? <img src={photoUrl} alt="profile" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <User size={40} color="#fff" />}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem', marginBottom: '0.4rem', flexWrap: 'wrap' }}>
            <h2 className="serif-font" style={{ fontSize: '1.8rem' }}>{displayName}</h2>
            {currentUser && (
              <span style={{ fontSize: '0.72rem', fontWeight: 700, padding: '0.2rem 0.7rem', borderRadius: '20px',
                background: cloudSynced ? 'rgba(76,175,80,0.15)' : 'rgba(255,152,0,0.15)',
                color: cloudSynced ? '#81c784' : '#ffb74d',
                border: `1px solid ${cloudSynced ? '#81c784' : '#ffb74d'}` }}>
                {cloudSynced ? '☁️ 클라우드 연동됨' : '⏳ 동기화 중...'}
              </span>
            )}
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginBottom: '0.5rem' }}>
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
            <button onClick={logout} style={{ padding: '0.4rem 1rem', background: 'transparent', color: 'var(--text-secondary)', border: '1px solid var(--text-secondary)', borderRadius: '20px', cursor: 'pointer', fontSize: '0.85rem' }}>
              로그아웃
            </button>
          )}
          <div style={{ width: '200px', height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', marginTop: '1rem', overflow: 'hidden' }}>
            <motion.div style={{ height: '100%', background: 'var(--accent-gold)', borderRadius: '3px' }}
              initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }} />
          </div>
        </div>
      </div>

      {/* Push Notifications Settings */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem' }}>
          <div style={{ background: 'rgba(196,164,132,0.1)', padding: '0.6rem', borderRadius: '50%' }}>
            <Bell size={20} color="var(--accent-gold)" />
          </div>
          <div>
            <h4 style={{ margin: 0, fontSize: '1.05rem', color: 'var(--text-primary)' }}>매일 묵상 알림</h4>
            <p style={{ margin: '0.2rem 0 0', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>아침 8시에 오늘의 말씀 알림을 받습니다.</p>
          </div>
        </div>
        
        {/* iOS style toggle switch */}
        <div 
          onClick={handlePushToggle}
          style={{
            width: '50px', height: '28px', borderRadius: '14px',
            background: pushEnabled ? '#81c784' : 'var(--glass-border)',
            display: 'flex', alignItems: 'center', cursor: 'pointer',
            padding: '2px', transition: 'background 0.3s'
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

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem' }}>
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
                  <div style={{ flex: 1 }}>
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
    </motion.div>
  );
};

export default Profile;
