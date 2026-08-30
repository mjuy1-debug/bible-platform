import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { UserContext } from '../context/UserContext';
import { Heart, BookOpen, Trash2, RefreshCw, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

const SAMPLE_STARTER_FAVORITES = [
  { ref: '요한복음 3:16', text: '하나님이 세상을 이처럼 사랑하사 독생자를 주셨으니 이는 그를 믿는 자마다 멸망하지 않고 영생을 얻게 하려 하심이라', book: '요한복음', chapter: 3, verse: 16 },
  { ref: '빌립보서 4:13', text: '내게 능력 주시는 자 안에서 내가 모든 것을 할 수 있느니라', book: '빌립보서', chapter: 4, verse: 13 },
  { ref: '시편 23:1', text: '여호와는 나의 목자시니 내게 부족함이 없으리로다', book: '시편', chapter: 23, verse: 1 },
  { ref: '이사야 41:10', text: '두려워하지 말라 내가 너와 함께 함이라 놀라지 말라 나는 네 하나님이 됨이라 내가 너를 굳세게 하리라 참으로 너를 도와 주리라 참으로 나의 의로운 오른손으로 너를 붙들리라', book: '이사야', chapter: 41, verse: 10 },
  { ref: '로마서 8:28', text: '우리가 알거니와 하나님을 사랑하는 자 곧 그의 뜻대로 부르심을 입은 자들에게는 모든 것이 합력하여 선을 이루느니라', book: '로마서', chapter: 8, verse: 28 },
];

const Favorites = () => {
  const { favorites, toggleFavorite, currentUser, forceSync, showToast } = useContext(UserContext);

  const formatDate = (iso) =>
    new Date(iso).toLocaleDateString('ko-KR', { month: 'long', day: 'numeric' });

  const handleAddStarterFavorites = () => {
    SAMPLE_STARTER_FAVORITES.forEach(item => {
      if (!favorites.some(f => f.ref === item.ref)) {
        toggleFavorite(item);
      }
    });
    showToast('✨ 은혜로운 대표 말씀들이 즐겨찾기에 등록되었습니다!');
  };

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

        {currentUser && (
          <button
            onClick={forceSync}
            style={{
              padding: '0.45rem 0.9rem',
              borderRadius: '20px',
              border: '1px solid var(--glass-border)',
              background: 'var(--glass-bg)',
              color: 'var(--accent-gold)',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <RefreshCw size={14} /> 클라우드 복구
          </button>
        )}
      </div>

      {favorites.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '4rem 1.5rem', color: 'var(--text-secondary)' }}>
          <Heart size={48} style={{ margin: '0 auto 1.2rem', opacity: 0.3, display: 'block' }} />
          <p style={{ fontSize: '1.1rem', marginBottom: '0.5rem', color: 'var(--text-primary)', fontWeight: 700 }}>저장된 즐겨찾기 말씀이 없습니다.</p>
          <p style={{ fontSize: '0.85rem', marginBottom: '1.8rem', lineHeight: 1.5 }}>
            성경 읽기 화면에서 구절을 터치한 후 <span style={{ color: '#f43f5e', fontWeight: 700 }}>[❤️ 즐겨찾기]</span> 버튼을 누르면 저장됩니다.
          </p>

          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', flexWrap: 'wrap' }}>
            {currentUser && (
              <button onClick={forceSync} className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <RefreshCw size={15} /> 클라우드에서 이전 기록 불러오기
              </button>
            )}
            <button onClick={handleAddStarterFavorites} className="btn-primary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
              <Sparkles size={15} /> 대표 은혜 구절 5선 담기
            </button>
            <Link to="/read">
              <button className="btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <BookOpen size={15} /> 말씀 읽으러 가기
              </button>
            </Link>
          </div>
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
