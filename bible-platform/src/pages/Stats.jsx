import React, { useContext } from 'react';
import { motion } from 'framer-motion';
import { BarChart2, BookOpen, Heart, Star, TrendingUp, Award } from 'lucide-react';
import { UserContext } from '../context/UserContext';
import { BIBLE_BOOKS } from '../data/bibleData';

// shortName → 전체 이름 매핑 (창 → 창세기)
const shortToFull = {};
(BIBLE_BOOKS || []).forEach(b => { if (b.shortName && b.name) shortToFull[b.shortName] = b.name; });

const Stats = () => {
  const { favorites = [], devotions = [], highlights = {}, planProgress = { completedDays: [] } } = useContext(UserContext);

  // 1. This month completed days
  const thisMonthCompleted = planProgress.completedDays.length > 0
    ? Math.min(planProgress.completedDays.length, 31) : 0;

  // 2. Top 5 Books
  const bookCounts = favorites.reduce((acc, fav) => {
    if (!fav.ref) return acc;
    const shortName = fav.ref.split(' ')[0];
    const fullName = shortToFull[shortName] || shortName;
    acc[fullName] = (acc[fullName] || 0) + 1;
    return acc;
  }, {});
  let topBooks = Object.entries(bookCounts).sort((a, b) => b[1] - a[1]).slice(0, 5);
  if (topBooks.length === 0) {
    topBooks = [['시편', 0], ['요한복음', 0], ['잠언', 0]];
  }
  const maxBookCount = Math.max(...topBooks.map(b => b[1]), 1);

  // 3. Heatmap (52 weeks x 7 days = 364 cells, last year)
  const heatmapCells = Array.from({ length: 364 }).map((_, i) => {
    const isCompleted = planProgress.completedDays.includes(i);
    return isCompleted ? 3 : 0;
  });
  const getHeatmapColor = (level) => {
    switch (level) {
      case 1: return 'rgba(212,175,55,0.2)';
      case 2: return 'rgba(212,175,55,0.5)';
      case 3: return 'rgba(212,175,55,1)';
      default: return 'rgba(255,255,255,0.07)';
    }
  };
  const months = ['1월','2월','3월','4월','5월','6월','7월','8월','9월','10월','11월','12월'];

  // 4. Devotion calendar – real last 30 days
  const today = new Date();
  const devCalendar = Array.from({ length: 30 }).map((_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() - (29 - i));
    const dateStr = d.toISOString().split('T')[0];
    return devotions.some(dev => {
      const devDate = dev.createdAt ? dev.createdAt.slice(0, 10) : '';
      return devDate === dateStr;
    });
  });
  const devWrittenCount = devCalendar.filter(Boolean).length;

  return (
    <div style={{
      padding: 'clamp(1rem, 4vw, 2rem)',
      paddingBottom: 'calc(var(--bottomnav-height, 64px) + 20px)',
      maxWidth: '900px',
      margin: '0 auto',
      color: 'var(--text-primary)',
    }}>
      {/* Header */}
      <header style={{ marginBottom: '2rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
        <BarChart2 size={28} color="var(--accent-gold)" />
        <h1 style={{ fontSize: 'clamp(1.4rem, 5vw, 2rem)', margin: 0, fontWeight: 'bold' }}>나의 말씀 통계</h1>
      </header>

      {/* Top Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))', gap: '1rem', marginBottom: '2rem' }}>
        {[
          { label: '이번 달 통독', value: `${thisMonthCompleted}일`, icon: <TrendingUp size={22} color="#4ade80" /> },
          { label: '즐겨찾기 구절', value: `${favorites.length}개`, icon: <Heart size={22} color="#f43f5e" /> },
          { label: '하이라이트', value: `${Object.keys(highlights).length}개`, icon: <Star size={22} color="var(--accent-gold)" /> },
          { label: '작성한 묵상', value: `${devotions.length}편`, icon: <BookOpen size={22} color="#60a5fa" /> },
        ].map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            style={{
              background: 'var(--bg-secondary)',
              padding: 'clamp(0.8rem, 3vw, 1.2rem)',
              borderRadius: '14px',
              border: '1px solid var(--glass-border)',
              display: 'flex',
              alignItems: 'center',
              gap: '0.75rem',
              minWidth: 0,
            }}
          >
            <div style={{ padding: '0.6rem', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', flexShrink: 0 }}>
              {stat.icon}
            </div>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{stat.label}</div>
              <div style={{ fontSize: 'clamp(1.1rem, 4vw, 1.4rem)', fontWeight: 'bold' }}>{stat.value}</div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Heatmap */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
        style={{ background: 'var(--bg-secondary)', padding: 'clamp(1rem,3vw,1.5rem)', borderRadius: '14px', border: '1px solid var(--glass-border)', marginBottom: '2rem' }}
      >
        <h2 style={{ fontSize: '1rem', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <Award size={18} color="var(--accent-gold)" /> 1년간의 말씀 여정
        </h2>
        <div style={{ overflowX: 'auto', paddingBottom: '0.5rem' }}>
          <div style={{ minWidth: '600px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.72rem' }}>
              {months.map(m => <span key={m}>{m}</span>)}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(52, 1fr)', gridTemplateRows: 'repeat(7, 10px)', gap: '3px' }}>
              {heatmapCells.map((level, i) => (
                <div key={i} style={{ width: '10px', height: '10px', borderRadius: '2px', background: getHeatmapColor(level) }} />
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* Bottom two panels */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 280px), 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
        {/* Top Books */}
        <motion.div
          initial={{ opacity: 0, x: -16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.5 }}
          style={{ background: 'var(--bg-secondary)', padding: '1.2rem', borderRadius: '14px', border: '1px solid var(--glass-border)' }}
        >
          <h2 style={{ fontSize: '1rem', marginBottom: '1.2rem' }}>가장 많이 읽은 성경</h2>
          {topBooks.length > 0 && topBooks[0][1] === 0 ? (
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', textAlign: 'center', padding: '1rem 0' }}>
              즐겨찾기 한 구절이 없습니다
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.8rem' }}>
              {topBooks.map(([book, count], i) => (
                <div key={book} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div style={{ width: '55px', fontSize: '0.85rem', flexShrink: 0 }}>{book}</div>
                  <div style={{ flex: 1, height: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '5px', overflow: 'hidden' }}>
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${(count / maxBookCount) * 100}%` }}
                      transition={{ duration: 0.8, delay: 0.5 + i * 0.1 }}
                      style={{ height: '100%', background: 'linear-gradient(90deg, rgba(212,175,55,0.5), var(--accent-gold))', borderRadius: '5px' }}
                    />
                  </div>
                  <div style={{ width: '40px', textAlign: 'right', fontSize: '0.85rem', color: 'var(--accent-gold)' }}>{count}구절</div>
                </div>
              ))}
            </div>
          )}
        </motion.div>

        {/* Devotion Calendar */}
        <motion.div
          initial={{ opacity: 0, x: 16 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.6 }}
          style={{ background: 'var(--bg-secondary)', padding: '1.2rem', borderRadius: '14px', border: '1px solid var(--glass-border)' }}
        >
          <h2 style={{ fontSize: '1rem', marginBottom: '1.2rem' }}>최근 30일 묵상 기록</h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            {devCalendar.map((isWritten, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.6 + i * 0.015 }}
                title={isWritten ? '묵상 작성함' : '작성 안함'}
                style={{
                  width: '20px', height: '20px', borderRadius: '50%',
                  background: isWritten ? 'var(--accent-gold)' : 'rgba(255,255,255,0.06)',
                  border: `1px solid ${isWritten ? 'transparent' : 'rgba(255,255,255,0.1)'}`,
                }}
              />
            ))}
          </div>
          <div style={{ marginTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
            이번 달은 총 <span style={{ color: 'var(--accent-gold)', fontWeight: 'bold' }}>{devWrittenCount}</span>일 묵상하셨네요!
          </div>
        </motion.div>
      </div>

      {/* Motivational */}
      <motion.div
        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.9 }}
        style={{ textAlign: 'center', padding: '1.5rem', background: 'linear-gradient(45deg, rgba(212,175,55,0.1), transparent)', borderRadius: '14px', border: '1px solid rgba(212,175,55,0.2)' }}
      >
        <h3 style={{ color: 'var(--accent-gold)', fontSize: '1.1rem', marginBottom: '0.4rem' }}>
          {devWrittenCount >= 20 ? '놀라운 은혜의 여정입니다!' :
           devWrittenCount >= 10 ? '말씀과 함께 성장하고 계시네요!' :
           devWrittenCount >= 1 ? '아름다운 묵상의 시작을 응원합니다!' :
           '첫 묵상을 작성해보세요!'}
        </h3>
        <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '0.9rem' }}>
          {devWrittenCount >= 20 ? '말씀과 함께하는 하루하루가 모여 큰 믿음의 발자취가 되고 있습니다.' :
           devWrittenCount >= 10 ? '꾸준한 묵상이 삶의 빛이 되어줄 것입니다.' :
           devWrittenCount >= 1 ? '작은 씨앗이 자라나 큰 나무가 되듯, 귀한 은혜의 시간이 될 것입니다.' :
           '오늘 내게 주시는 하나님의 말씀을 기록하며 하루를 열어보세요.'}
        </p>
      </motion.div>
    </div>
  );
};

export default Stats;
