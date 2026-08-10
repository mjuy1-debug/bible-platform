import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, BookOpen, Heart, Star, TrendingUp, Award } from 'lucide-react';
// Assuming UserContext is defined elsewhere in the app.
// import { UserContext } from '../context/UserContext';

// Dummy UserContext for standalone rendering if needed
const UserContext = React.createContext({
  favorites: [
    { book: '요한복음' }, { book: '요한복음' }, { book: '시편' }, { book: '시편' }, { book: '시편' }, { book: '창세기' }, { book: '로마서' }
  ],
  devotions: new Array(12).fill({}),
  highlights: { '1': true, '2': true, '3': true },
  planProgress: {
    completedDays: Array.from({length: 45}, () => Math.floor(Math.random() * 365)) // Random day indices
  }
});

const Stats = () => {
  // Use context safely
  const { favorites = [], devotions = [], highlights = {}, planProgress = { completedDays: [] } } = useContext(UserContext);

  // 1. Calculate this month's completed days (approximate for demo based on mock data)
  const thisMonthCompleted = planProgress.completedDays.length > 0 ? Math.min(planProgress.completedDays.length, 12) : 0;
  
  // 3. Top 5 Books
  const bookCounts = favorites.reduce((acc, fav) => {
    acc[fav.book] = (acc[fav.book] || 0) + 1;
    return acc;
  }, {});
  let topBooks = Object.entries(bookCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (topBooks.length === 0) {
    topBooks = [['시편', 5], ['요한복음', 3], ['잠언', 2]]; // Placeholder
  }
  const maxBookCount = Math.max(...topBooks.map(b => b[1]), 1);

  // 4. Heatmap generator (364 days, 52 cols x 7 rows)
  // Just randomize for visual demo based on completedDays length
  const heatmapCells = Array.from({ length: 364 }).map((_, i) => {
    // Random chance based on overall completion
    const isCompleted = Math.random() < (planProgress.completedDays.length / 365);
    if (!isCompleted) return 0;
    const intensity = Math.random();
    if (intensity < 0.3) return 1;
    if (intensity < 0.7) return 2;
    return 3;
  });

  const getHeatmapColor = (level) => {
    switch(level) {
      case 1: return 'rgba(212,175,55,0.2)';
      case 2: return 'rgba(212,175,55,0.5)';
      case 3: return 'rgba(212,175,55,1)';
      default: return '#1a1a1a';
    }
  };

  const months = ['1월', '2월', '3월', '4월', '5월', '6월', '7월', '8월', '9월', '10월', '11월', '12월'];

  // 5. Devotion calendar (last 30 days)
  const devCalendar = Array.from({ length: 30 }).map(() => Math.random() > 0.6);

  return (
    <div style={{ padding: '2rem', maxWidth: '1000px', margin: '0 auto', color: 'var(--text-primary, #fff)', fontFamily: 'sans-serif' }}>
      <header style={{ marginBottom: '3rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <BarChart2 size={32} color="var(--accent-gold, #d4af37)" />
        <h1 style={{ fontSize: '2.5rem', margin: 0 }}>나의 말씀 통계</h1>
      </header>

      {/* Top Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '3rem' }}>
        {[
          { label: '이번 달 통독 완료', value: `${thisMonthCompleted}일`, icon: <TrendingUp size={24} color="#4ade80" /> },
          { label: '즐겨찾기 구절', value: `${favorites.length}개`, icon: <Heart size={24} color="#f43f5e" /> },
          { label: '하이라이트 구절', value: `${Object.keys(highlights).length}개`, icon: <Star size={24} color="var(--accent-gold, #d4af37)" /> },
          { label: '작성한 묵상', value: `${devotions.length}편`, icon: <BookOpen size={24} color="#60a5fa" /> },
        ].map((stat, i) => (
          <motion.div 
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            style={{ background: 'var(--bg-secondary, #1a1a1a)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--glass-border, rgba(255,255,255,0.1))', display: 'flex', alignItems: 'center', gap: '1rem' }}
          >
            <div style={{ padding: '1rem', background: 'rgba(255,255,255,0.05)', borderRadius: '12px' }}>
              {stat.icon}
            </div>
            <div>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary, #aaa)', marginBottom: '0.2rem' }}>{stat.label}</div>
              <div style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Heatmap Contribution Graph */}
      <motion.div 
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        style={{ background: 'var(--bg-secondary, #1a1a1a)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border, rgba(255,255,255,0.1))', marginBottom: '3rem' }}
      >
        <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={20} color="var(--accent-gold, #d4af37)" /> 1년간의 말씀 여정
        </h2>
        <div style={{ overflowX: 'auto', paddingBottom: '1rem' }}>
          <div style={{ minWidth: '800px' }}>
            {/* Month labels roughly spaced */}
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', color: 'var(--text-secondary, #aaa)', fontSize: '0.8rem', paddingLeft: '20px' }}>
              {months.map(m => <span key={m}>{m}</span>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(52, 1fr)', gridTemplateRows: 'repeat(7, 12px)', gap: '4px' }}>
              {heatmapCells.map((level, i) => (
                <div key={i} style={{ width: '12px', height: '12px', borderRadius: '2px', background: getHeatmapColor(level), transition: 'background 0.3s' }} title={`Day ${i+1}`} />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '2rem', marginBottom: '3rem' }}>
        {/* Top Books */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }} style={{ background: 'var(--bg-secondary, #1a1a1a)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border, rgba(255,255,255,0.1))' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>가장 많이 읽은 성경</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {topBooks.map(([book, count], i) => (
              <div key={book} style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                <div style={{ width: '60px', fontSize: '0.9rem' }}>{book}</div>
                <div style={{ flex: 1, height: '12px', background: 'rgba(255,255,255,0.05)', borderRadius: '6px', overflow: 'hidden' }}>
                  <motion.div 
                    initial={{ width: 0 }} 
                    animate={{ width: `${(count / maxBookCount) * 100}%` }} 
                    transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                    style={{ height: '100%', background: 'linear-gradient(90deg, rgba(212,175,55,0.5), var(--accent-gold, #d4af37))', borderRadius: '6px' }}
                  />
                </div>
                <div style={{ width: '30px', textAlign: 'right', fontSize: '0.9rem', color: 'var(--accent-gold, #d4af37)' }}>{count}</div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Devotion Calendar */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }} style={{ background: 'var(--bg-secondary, #1a1a1a)', padding: '2rem', borderRadius: '16px', border: '1px solid var(--glass-border, rgba(255,255,255,0.1))' }}>
          <h2 style={{ fontSize: '1.2rem', marginBottom: '1.5rem' }}>최근 30일 묵상 기록</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {devCalendar.map((isWritten, i) => (
              <motion.div 
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 + i * 0.02 }}
                style={{
                  width: '24px', height: '24px', borderRadius: '50%',
                  background: isWritten ? 'var(--accent-gold, #d4af37)' : 'rgba(255,255,255,0.05)',
                  border: `1px solid ${isWritten ? 'transparent' : 'rgba(255,255,255,0.1)'}`
                }}
                title={isWritten ? '묵상 작성함' : '작성하지 않음'}
              />
            ))}
          </div>
          <div style={{ marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary, #aaa)', textAlign: 'center' }}>
            이번 달은 총 <span style={{ color: 'var(--accent-gold, #d4af37)', fontWeight: 'bold' }}>{devCalendar.filter(Boolean).length}</span>일 묵상하셨네요!
          </div>
        </motion.div>
      </div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1 }} style={{ textAlign: 'center', padding: '2rem', background: 'linear-gradient(45deg, rgba(212,175,55,0.1), rgba(0,0,0,0))', borderRadius: '16px', border: '1px solid rgba(212,175,55,0.2)' }}>
        <h3 style={{ color: 'var(--accent-gold, #d4af37)', fontSize: '1.3rem', marginBottom: '0.5rem' }}>놀라운 은혜의 여정입니다!</h3>
        <p style={{ color: 'var(--text-secondary, #aaa)', margin: 0 }}>말씀과 함께하는 하루하루가 모여 큰 믿음의 발자취가 되고 있습니다.</p>
      </motion.div>
    </div>
  );
};

export default Stats;
