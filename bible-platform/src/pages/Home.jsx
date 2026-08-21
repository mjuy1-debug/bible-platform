import React, { useContext, useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
// eslint-disable-next-line no-unused-vars
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Sparkles, CalendarDays, BookHeart, ArrowRight, Heart, Search, CalendarClock, Clock, X, MapPin, AlignLeft, Users, Handshake, Map, FileText, Brain, Music, Trophy, Megaphone, Video } from 'lucide-react';
import { UserContext } from '../context/UserContext';
import { CATEGORY_COLORS, CATEGORY_LABELS, getUpcomingEvents } from '../data/scheduleData';
import { getTodayVerse } from '../data/dailyVerses';
import LiveBanner from '../components/LiveBanner';

// 홈화면 퀵 링크 - 주요 기능
const MAIN_LINKS = [
  { to: '/read',       icon: BookOpen,     title: '성경 읽기',   color: '#4f86c6' },
  { to: '/sermon',     icon: Video,        title: '말씀과 설교', color: '#ff6b6b' },
  { to: '/hymns',      icon: Music,        title: '찬송가',      color: '#e5a93b' },
  { to: '/devotion',   icon: BookHeart,    title: '묵상 노트',   color: '#c4a484' },
  { to: '/plan',       icon: CalendarDays, title: '통독 플랜',   color: '#5bbf6e' },
  { to: '/ai',         icon: Sparkles,     title: 'AI 도우미',   color: '#9b7de8' },
  { to: '/memorize',   icon: Brain,        title: '말씀 암송',   color: '#64b5f6' },
  { to: '/favorites',  icon: Heart,        title: '즐겨찾기',    color: '#e85b72' },
];

// 커뮤니티 & 기타
const COMMUNITY_LINKS = [
  { to: '/announce',   icon: Megaphone,     title: '교회 공지',   color: '#fbbf24' },
  { to: '/quiz',       icon: Trophy,        title: '말씀 퀴즈',   color: '#f59e0b' },
  { to: '/schedule',   icon: CalendarClock, title: '일정 & 계획',  color: '#e8a73d' },
  { to: '/bulletin',   icon: FileText,      title: '교회 주보',   color: '#ff8a65' },
  { to: '/prayer-wall',icon: Handshake,     title: '중보 기도',   color: '#81c784' },
  { to: '/groups',     icon: Users,         title: '소그룹',        color: '#4db6ac' },
  { to: '/bible-map',  icon: Map,           title: '성경 지도',   color: '#ba68c8' },
  { to: '/search',     icon: Search,        title: '말씀 검색',   color: '#f5a623' },
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

      {/* 실시간 주일/수요 예배 라이브 스트리밍 알림 배너 */}
      <LiveBanner />

      {/* Hero */}
      <div style={{ textAlign: 'center', padding: 'clamp(2rem, 5vw, 4rem) 0 clamp(2rem, 4vw, 3.5rem)', position: 'relative' }}>
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
          BethelChurch<br />말씀묵상
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
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(90px, 1fr))', gap: 'clamp(0.75rem, 2vw, 1.5rem)', maxWidth: '600px', margin: '0 auto 2.5rem' }}>
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
              // 카테고리를 배열로 정규화 (문자열/배열 모두 처리)
              const cats = Array.isArray(ev.category)
                ? ev.category
                : (typeof ev.category === 'string' ? ev.category.split(',').map(s => s.trim()) : [ev.category]);

              // 카드 배경/테두리는 첫 번째 카테고리 색상 사용
              const firstColors = CATEGORY_COLORS[cats[0]] || CATEGORY_COLORS.normal;

              return (
                <div key={ev.id} onClick={() => setSelectedEvent(ev)} style={{ textDecoration: 'none', cursor: 'pointer' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: '0.8rem',
                    padding: '0.8rem 1rem', borderRadius: '12px',
                    background: firstColors.bg, border: `1px solid ${firstColors.border}`,
                    transition: 'transform 0.15s',
                  }}
                    onMouseOver={e => e.currentTarget.style.transform = 'translateX(4px)'}
                    onMouseOut={e => e.currentTarget.style.transform = ''}>
                    <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: firstColors.dot, flexShrink: 0 }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{ev.title}</p>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', fontSize: '0.75rem', color: firstColors.text, marginTop: '0.2rem' }}>
                        <span>{ev.date.slice(5).replace('-', '/')}</span>
                        {ev.time && <span style={{ display: 'flex', alignItems: 'center', gap: '0.2rem' }}><Clock size={10} /> {ev.time}</span>}
                        {/* 모든 카테고리 태그 표시 */}
                        {cats.map(cat => {
                          const c = CATEGORY_COLORS[cat] || CATEGORY_COLORS.normal;
                          const lbl = CATEGORY_LABELS[cat] || CATEGORY_LABELS.normal;
                          return (
                            <span key={cat} style={{ padding: '0 0.4rem', borderRadius: '6px', background: c.bg, color: c.text, fontWeight: 600, fontSize: '0.68rem', border: `1px solid ${c.border}` }}>
                              {lbl}
                            </span>
                          );
                        })}
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

      {/* Quick Links - Main Features */}
      <div style={{ maxWidth: '960px', margin: '0 auto 2rem' }}>
        <h2 className="serif-font" style={{ fontSize: 'clamp(1.1rem, 2.5vw, 1.4rem)', marginBottom: '1rem', color: 'var(--text-secondary)', letterSpacing: '1px', textTransform: 'uppercase', fontSize: '0.82rem', fontWeight: 700 }}>✦ 주요 기능</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 'clamp(0.6rem, 1.5vw, 1rem)' }}>
          {MAIN_LINKS.map(({ to, icon: Icon, title, color }, i) => (
            <motion.div key={to} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 + i * 0.06 }}>
              <Link to={to} style={{ textDecoration: 'none' }}>
                <div className="glass-card" style={{ padding: 'clamp(0.9rem, 2.5vw, 1.3rem)', textAlign: 'center',
                  transition: 'transform 0.2s, border-color 0.2s', cursor: 'pointer' }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = color; }}
                  onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = ''; }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: color + '22',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.7rem' }}>
                    <Icon size={22} color={color} />
                  </div>
                  <p style={{ fontSize: 'clamp(0.82rem, 2vw, 0.95rem)', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</p>
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Quick Links - Community */}
      <div style={{ maxWidth: '960px', margin: '0 auto' }}>
        <h2 style={{ fontSize: '0.82rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-secondary)', letterSpacing: '1px', textTransform: 'uppercase' }}>✦ 커뮤니티 & 탐색</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(100px, 1fr))', gap: 'clamp(0.6rem, 1.5vw, 1rem)' }}>
          {COMMUNITY_LINKS.map(({ to, icon: Icon, title, color }, i) => (
            <motion.div key={to} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 + i * 0.06 }}>
              <Link to={to} style={{ textDecoration: 'none' }}>
                <div className="glass-card" style={{ padding: 'clamp(0.9rem, 2.5vw, 1.3rem)', textAlign: 'center',
                  transition: 'transform 0.2s, border-color 0.2s', cursor: 'pointer' }}
                  onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.borderColor = color; }}
                  onMouseOut={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.borderColor = ''; }}>
                  <div style={{ width: '44px', height: '44px', borderRadius: '14px', background: color + '22',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 0.7rem' }}>
                    <Icon size={22} color={color} />
                  </div>
                  <p style={{ fontSize: 'clamp(0.82rem, 2vw, 0.95rem)', fontWeight: 700, color: 'var(--text-primary)' }}>{title}</p>
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
          const firstCat = Array.isArray(selectedEvent.category) ? selectedEvent.category[0] : (typeof selectedEvent.category === 'string' ? selectedEvent.category.split(',')[0].trim() : selectedEvent.category);
          const colors = CATEGORY_COLORS[firstCat] || CATEGORY_COLORS.normal;
          const label = CATEGORY_LABELS[firstCat] || CATEGORY_LABELS.normal;

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
                style={{ width: '100%', maxWidth: '480px', padding: '1.8rem', maxHeight: '85vh', overflowY: 'auto' }}
                onClick={e => e.stopPropagation()}
              >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.2rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
                    <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: colors.dot, flexShrink: 0 }} />
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: colors.text,
                      background: colors.bg, padding: '0.2rem 0.8rem', borderRadius: '20px', border: `1px solid ${colors.border}` }}>
                      {label}
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
                      <span style={{ lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{selectedEvent.description}</span>
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
