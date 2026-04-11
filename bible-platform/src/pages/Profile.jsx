import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { Bookmark, History, Trash2, User } from 'lucide-react';
import { UserContext } from '../context/UserContext';

const Profile = () => {
  const { favorites, devotions, planProgress, toggleFavorite } = useContext(UserContext);
  const { completedDays, totalDays } = planProgress;
  const pct = ((completedDays.length / totalDays) * 100).toFixed(1);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }} style={{ maxWidth: '900px', margin: '0 auto' }}>
      {/* Profile Header */}
      <div className="glass-card" style={{ display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '3rem', flexWrap: 'wrap' }}>
        <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent-gold), #8B6914)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
          <User size={40} color="#fff" />
        </div>
        <div style={{ flex: 1 }}>
          <h2 className="serif-font" style={{ fontSize: '1.8rem', marginBottom: '0.4rem' }}>믿음의 자녀</h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            즐겨찾기 {favorites.length}개 · 묵상 {devotions.length}편 · 통독 진행률 {pct}%
          </p>
          <div style={{ width: '200px', height: '6px', background: 'var(--bg-secondary)', borderRadius: '3px', marginTop: '0.8rem', overflow: 'hidden' }}>
            <motion.div style={{ height: '100%', background: 'var(--accent-gold)', borderRadius: '3px' }}
              initial={{ width: 0 }} animate={{ width: `${pct}%` }} transition={{ duration: 1 }} />
          </div>
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
