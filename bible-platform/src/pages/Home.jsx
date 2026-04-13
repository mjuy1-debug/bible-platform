import React, { useContext, useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, CalendarDays, BookHeart, ArrowRight, Heart, Search, CalendarClock, Clock, X, MapPin, AlignLeft } from 'lucide-react';
import { UserContext } from '../context/UserContext';
import { CATEGORY_COLORS, CATEGORY_LABELS, getUpcomingEvents } from '../data/scheduleData';
import { getTodayVerse } from '../data/dailyVerses';

const QUICK_LINKS = [
  { to: '/read',      icon: BookOpen,      title: '성경 읽기',    desc: '말씀을 천천히 읽으며 하루를 시작해보세요.', color: '#4f86c6' },
  { to: '/devotion',  icon: BookHeart,     title: '묵상 노트',    desc: '오늘 느낀 은혜를 기록으로 남겨보세요.', color: '#c4a484' },
  { to: '/ai',        icon: Sparkles,      title: 'AI 도우미',    desc: '오늘 읽은 말씀을 함께 묵상해 드립니다.', color: '#9b7de8' },
  { to: '/plan',      icon: CalendarDays,  title: '통독 플랜',    desc: '나만의 통독 플랜을 설정하고 실천해보세요.', color: '#5bbf6e' },
  { to: '/schedule',  icon: CalendarClock, title: '일정 & 계획',  desc: '여호수아 남전도회와 교회 일정을 확인하세요.', color: '#e8a73d' },
  { to: '/favorites', icon: Heart,         title: '즐겨찾기',     desc: '마음에 새긴 말씀들을 모아보세요.', color: '#e85b72' },
  { to: '/search',    icon: Search,        title: '말씀 찾기',    desc: '원하는 구절을 빠르게 검색하세요.', color: '#f5a623' },
];

const Home = () => {
  const { planProgress, devotions, favorites, events } = useContext(UserContext);
  const { completedDays, totalDays } = planProgress;
  const pct = ((completedDays.length / totalDays) * 100).toFixed(1);

  const todayVerse = getTodayVerse();

  const upcoming = useMemo(() => getUpcomingEvents(events, 3), [events]);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const [greeting, setGreeting] = useState('');
  useEffect(() => {
    const h = new Date().getHours();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (h < 5)  setGreeting('아직 밤이 깊네요. 말씀 안에서 쉬세요 🌙');
    else if (h < 12) setGreeting('좋은 아침이에요 ☀️ 오늘도 말씀으로 시작해요');
    else if (h < 17) setGreeting('오후에도 말씀과 함께해요 🌿');
    else if (h < 21) setGreeting('저녁에 찾아와 주셨네요 🌆');
    else setGreeting('오늘 하루도 수고하셨어요 🌙');
  }, []);

  return (
    <>
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.6 }}>

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: 'clamp(2.5rem, 6vw, 5rem) 0 clamp(2rem, 4vw, 3.5rem)', position: 'relative' }}>
        <motion.span
          style={{ display: 'inline-block', background: 'var(--bg-secondary)', padding: '0.4rem 1.2rem',
            borderRadius: '20px', fontSize: '0.82rem', color: 'var(--accent-gold)', marginBottom: '1.2rem',
            border: '1px solid var(--glass-border)' }}
          initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          {new Date().toLocaleDateString('ko-KR', { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' })}
        </motion.span>

        <motion.p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.9rem, 2vw, 1.1rem)', marginBottom: '0.8rem' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>
          {greeting}
        </motion.p>

        <motion.h1 className="serif-font"
          style={{ fontSize: 'clamp(2rem, 6vw, 4rem)', lineHeight: 1.3, marginBottom: '0.5rem',
            background: 'linear-gradient(135deg, var(--text-primary) 40%, var(--accent-gold))',
            WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          Joshua 말씀묵상
        </motion.h1>
        <motion.p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}
          initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.35 }}>
          말씀을 읽고, 듣고, 묵상하는 하루
        </motion.p>
      </div>

      {/* Today's Verse */}
      <motion.div className="glass-card"
        style={{ maxWidth: '720px', margin: '0 auto 2.5rem', textAlign: 'center', padding: 'clamp(1.5rem, 4vw, 2.5rem)', position: 'relative' }}
        initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
        <p style={{ fontSize: '0.75rem', letterSpacing: '3px', textTransform: 'uppercase', color: 'var(--accent-gold)', marginBottom: '1.5rem', fontWeight: 700 }}>
          ✦ 오늘의 말씀 ✦
        </p>
        <p className="serif-font" style={{ fontSize: 'clamp(1.05rem, 2.8vw, 1.5rem)', lineHeight: 1.9, marginBottom: '1.2rem', color: 'var(--text-primary)', wordBreak: 'keep-all' }}>
          &ldquo;{todayVerse.text}&rdquo;
        </p>
        <p style={{ color: 'var(--accent-gold)', fontStyle: 'italic', fontWeight: 600, fontSize: '0.9rem' }}>
          — {todayVerse.ref} —
        </p>
        <Link to="/devotion" state={{ verse: todayVerse.ref, verseText: todayVerse.text }}
          style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', marginTop: '1.5rem',
            background: 'rgba(196,164,132,0.15)', color: 'var(--accent-gold)', padding: '0.55rem 1.3rem',
            borderRadius: '30px', border: '1px solid var(--glass-border)', fontWeight: 600, fontSize: '0.88rem' }}>
          ✏️ 이 말씀으로 묵상 쓰기 →
        </Link>
      </motion.div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 'clamp(0.75rem, 2vw, 1.5rem)', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
        {[
          { label: '통독 진행률', value: `${pct}%`, to: '/plan' },
          { label: '저장한 묵상', value: `${devotions.length}편`, to: '/devotion' },
          { label: '즐겨찾기', value: `${favorites.length}개`, to: '/favorites' },
        ].map(({ label, value, to }, i) => (
          <motion.div key={label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 + i * 0.08 }}>
            <Link to={to} style={{ textDecoration: 'none' }}>
              <div className="glass-card" style={{ textAlign: 'center', padding: 'clamp(1rem, 3vw, 1.5rem)',
                transition: 'transform 0.2s, border-color 0.2s' }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = 'var(--accent-gold)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = ''; }}>
                <p style={{ fontSize: 'clamp(1.4rem, 4vw, 2rem)', fontWeight: 700, color: 'var(--accent-gold)', marginBottom: '0.25rem' }}>{value}</p>
                <p style={{ fontSize: 'clamp(0.72rem, 1.8vw, 0.85rem)', color: 'var(--text-secondary)' }}>{label}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      {/* Upcoming Events Widget */}
      {upcoming.length > 0 && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.55 }}
          style={{ maxWidth: '720px', margin: '0 auto 2.5rem' }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.8rem' }}>
            <h3 className="serif-font" style={{ fontSize: '1.1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <CalendarClock size={18} color="var(--accent-gold)" /> 다가오는 일정
            </h3>
            <Link to="/schedule" style={{ fontSize: '0.82rem', color: 'var(--accent-gold)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              전체보기 <ArrowRight size={13} />
            </Link>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {upcoming.map(ev => {
              const colors = CATEGORY_COLORS[ev.category];
              return (
                <div key={ev.id} onClick={() => setSelectedEvent(ev)} style={{ textDecoration: 'none', cursor: 'pointer' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.8rem',
                    padding: '0.8rem 1rem', borderRadius: '12px',
                    background: colors.bg, border: `1px solid ${colors.border}`,
                    transition: 'transform 0.15s',
                  }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateX(4px)'}
                    onMouseOut={e => e.currentTarget.style.transform = ''}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: colors.dot, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{ev.title}</p>
                      <div style={{ display: 'flex', gap: '0.6rem', fontSize: '0.75rem', color: colors.text }}>
                        <span>{ev.date.slice(5).replace('-', '/')}</span>
                        {ev.time && <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Clock size={10} /> {ev.time}</span>}
                        <span style={{ padding: '0 0.4rem', borderRadius: '6px', background: colors.bg, fontWeight: 600, fontSize: '0.68rem' }}>
                          {CATEGORY_LABELS[ev.category]}
                        </span>
                      </div>
                    </div>
                    <ArrowRight size={14} color="var(--text-secondary)" />
                  </div>
                </div>
              );
            })}
          </div>
        </motion.div>
      )}

      {/* Quick Links */}
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <h2 className="serif-font" style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', marginBottom: '1.5rem', textAlign: 'center' }}>빠른 이동</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(160px, 100%), 1fr))', gap: 'clamp(0.75rem, 2vw, 1.2rem)' }}>
          {/* eslint-disable-next-line no-unused-vars */}
          {QUICK_LINKS.map(({ to, icon: Icon, title, desc, color }, i) => (
            <motion.div key={to} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 + i * 0.07 }}>
              <Link to={to} style={{ display: 'block', textDecoration: 'none' }}>
                <div className="glass-card" style={{ height: '100%', padding: 'clamp(1rem, 3vw, 1.5rem)',
                  transition: 'transform 0.25s, box-shadow 0.25s, border-color 0.25s' }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.borderColor = color; }}
                  onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = ''; }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '12px', background: color + '22',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '0.9rem' }}>
                    <Icon size={20} color={color} />
                  </div>
                  <h3 style={{ fontSize: 'clamp(0.95rem, 2.2vw, 1.1rem)', marginBottom: '0.4rem', color: 'var(--text-primary)' }}>{title}</h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: 'clamp(0.78rem, 1.8vw, 0.88rem)', lineHeight: 1.55, wordBreak: 'keep-all' }}>{desc}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', marginTop: '1rem', color, fontSize: '0.82rem', fontWeight: 600 }}>
                    시작하기 <ArrowRight size={13} />
                  </div>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>

      {/* ─── Event Detail Modal ─── */}
      <AnimatePresence>
        {selectedEvent && (() => {
          const colors = CATEGORY_COLORS[selectedEvent.category];
          return (
            <motion.div
              key="event-modal"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              style={{
                position: 'fixed', inset: 0, zIndex: 3000,
                background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                padding: '1.5rem',
              }}
              onClick={() => setSelectedEvent(null)}
            >
              <motion.div
                initial={{ scale: 0.92, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.92, opacity: 0 }}
                transition={{ type: 'spring', damping: 20, stiffness: 300 }}
                className="glass-card"
                style={{ width: '100%', maxWidth: '480px', padding: '1.8rem' }}
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: colors.dot, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: colors.text,
                      background: colors.bg, padding: '0.2rem 0.8rem', borderRadius: '20px', border: `1px solid ${colors.border}` }}>
                      {CATEGORY_LABELS[selectedEvent.category]}
                    </span>
                  </div>
                  <button onClick={() => setSelectedEvent(null)}
                    style={{ padding: '0.3rem', background: 'var(--bg-secondary)', borderRadius: '50%',
                      border: '1px solid var(--glass-border)', color: 'var(--text-secondary)', cursor: 'pointer' }}>
                    <X size={18} />
                  </button>
                </div>

                {/* Title */}
                <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem', lineHeight: 1.4 }}>
                  {selectedEvent.title}
                </h3>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.7rem', marginBottom: '1.4rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.7rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                    <CalendarClock size={16} color="var(--accent-gold)" />
                    <span>
                      {selectedEvent.date.replace(/-/g, '.')}
                      {selectedEvent.endDate && ` ~ ${selectedEvent.endDate.replace(/-/g, '.')}`}
                      {selectedEvent.time && ` · ${selectedEvent.time}`}
                    </span>
                  </div>
                  {selectedEvent.description && (
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.7rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                      <AlignLeft size={16} color="var(--accent-gold)" style={{ flexShrink: 0, marginTop: '0.15rem' }} />
                      <span style={{ lineHeight: 1.6 }}>{selectedEvent.description}</span>
                    </div>
                  )}
                </div>

                {/* Footer btn */}
                <Link to="/schedule" onClick={() => setSelectedEvent(null)}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                    padding: '0.75rem', borderRadius: '10px', background: 'var(--accent-gold)',
                    color: '#1a1a2e', fontWeight: 700, fontSize: '0.9rem', textDecoration: 'none',
                    transition: 'opacity 0.2s' }}>
                  전체 일정 보기 <ArrowRight size={16} />
                </Link>
              </motion.div>
            </motion.div>
          );
        })()}
      </AnimatePresence>
    </>
  );
};

export default Home;
