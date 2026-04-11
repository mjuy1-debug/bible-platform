import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { UserContext } from '../context/UserContext';
import { Heart, BookOpen, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Favorites = () => {
  const { favorites, toggleFavorite } = useContext(UserContext);

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.5 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h2 className="serif-font" style={{ fontSize: 'clamp(1.5rem, 4vw, 2rem)', color: 'var(--accent-gold)', marginBottom: '0.3rem' }}>
            ❤️ 즐겨찾기 말씀
          </h2>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
            마음에 새긴 말씀들 ({favorites.length}개)
          </p>
        </div>
      </div>

      {favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '5rem 2rem', color: 'var(--text-secondary)' }}>
          <Heart size={48} style={{ margin: '0 auto 1.5rem', opacity: 0.3, display: 'block' }} />
          <p style={{ fontSize: '1.1rem', marginBottom: '0.8rem' }}>아직 저장된 말씀이 없습니다.</p>
          <p style={{ fontSize: '0.9rem', marginBottom: '2rem' }}>말씀 읽기 중 ❤️ 버튼을 눌러 저장해 보세요.</p>
          <Link to="/read">
            <button className="btn-primary">
              <BookOpen size={16} />
              말씀 읽으러 가기
            </button>
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {favorites.map((fav, idx) => (
            <motion.div
              key={fav.ref + idx}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.04 }}
              className="glass-card"
              style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.8rem' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <p style={{ fontSize: '0.8rem', color: 'var(--accent-gold)', fontWeight: 700, marginBottom: '0.4rem' }}>
                    {fav.ref}
                    {fav.savedAt && (
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 400, marginLeft: '0.6rem' }}>
                        · {formatDate(fav.savedAt)} 저장
                      </span>
                    )}
                  </p>
                  <p className="serif-font" style={{ fontSize: 'clamp(1rem, 2.5vw, 1.15rem)', lineHeight: 1.75, color: 'var(--text-primary)' }}>
                    {fav.text}
                  </p>
                </div>
                <button
                  onClick={() => toggleFavorite(fav)}
                  style={{ color: '#ef4444', padding: '0.5rem', borderRadius: '50%', flexShrink: 0, minWidth: '44px', minHeight: '44px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                  title="즐겨찾기 제거"
                >
                  <Trash2 size={18} />
                </button>
              </div>

              {/* 이 말씀으로 묵상 쓰기 */}
              <Link to="/devotion" state={{ verse: fav.ref, verseText: fav.text }}
                style={{ alignSelf: 'flex-start', display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.82rem', color: 'var(--accent-gold)', fontWeight: 600 }}>
                ✏️ 이 말씀으로 묵상 쓰기 →
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
};

export default Favorites;
